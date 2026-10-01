/**
 * Imports public health facilities — clinics, CDCs and district hospitals —
 * from the Western Cape Government's own facility directory, and regenerates
 * lib/garden-route/public-health.ts.
 *
 * Why this source. Seventeen of our towns had no medical listing at all, and
 * neither of the other two sources can fix that:
 *   - OpenStreetMap has zero named healthcare within 5km of Calitzdorp,
 *     Ladismith, De Rust, Heidelberg, Albertinia, Great Brak River and
 *     Wilderness. It is not that our import missed them; they are not there.
 *   - Chain pharmacies do not operate in those towns. Clicks returns no
 *     branch for any of them.
 *
 * What those towns do have is a provincial clinic, and the Western Cape
 * Government publishes every one with GPS, street address, switchboard,
 * email and operating hours. For a community directory that is also the more
 * useful listing than a mall pharmacy an hour away.
 *
 * Each facility page carries a "District" field, so the Garden Route set can
 * be taken exactly rather than inferred from a bounding box.
 *
 * Run:  node scripts/import-public-health.mjs
 *
 * Source: https://www.westerncape.gov.za/health-wellness/facility
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOWNS, haversineKm } from './lib/towns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'public-health.ts');

const ORIGIN = 'https://www.westerncape.gov.za';
const INDEX = `${ORIGIN}/health-wellness/facility`;

/** Districts to keep. Garden Route District covers all 32 of our towns. */
const KEEP_DISTRICTS = [/garden route/i];

/** A facility further than this from every town is dropped (km). */
const MAX_TOWN_KM = 25;

const DELAY_MS = 1200;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

/**
 * Facility kinds that are not places a resident goes for care. Forensic
 * pathology is a mortuary service; depots and laundries are logistics.
 */
const EXCLUDE = /forensic pathology|laundry|depot|warehouse|pharmaceutical depot|stores$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-ZA,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Strips tags and returns the page as trimmed, non-empty text lines. */
function toLines(html) {
  const body = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, '');
  return body
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Value on the line after a label, when it is not itself another label. */
const LABELS = new Set([
  'Locate', 'Address', 'Location name', 'District', 'Facility Contact(s)',
  'Telephone', 'Email', 'Contact Name', 'Operating Hours', 'Get Directions',
]);

function fieldAfter(lines, label) {
  const i = lines.indexOf(label);
  if (i === -1) return undefined;
  const value = lines[i + 1];
  if (!value || LABELS.has(value)) return undefined;
  return value;
}

/** +27287351045 → 028 735 1045; leaves anything unexpected alone. */
function formatPhone(raw) {
  if (!raw) return undefined;
  const digits = raw.replace(/[^\d+]/g, '');
  const local = digits.startsWith('+27') ? `0${digits.slice(3)}` : digits;
  if (!/^0\d{9}$/.test(local)) return raw.trim() || undefined;
  return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
}

function categoryOf(name) {
  if (/hospital/i.test(name)) return 'Hospital';
  if (/pharmacy|depot/i.test(name)) return 'Pharmacy';
  return 'Clinic';
}

/** "Mon Tue Wed Thu Fri   07:30-16:00" → { days, time }. */
function parseHours(raw) {
  if (!raw) return undefined;
  const m = raw.match(/^([A-Za-z ]+?)\s{2,}(.+)$/) || raw.match(/^([A-Za-z ]+?)\s+([\d:.\-\s]+)$/);
  if (!m) return [{ days: 'Hours', time: raw.trim() }];
  const days = m[1].trim().split(/\s+/);
  const label = days.length > 2 ? `${days[0]}–${days[days.length - 1]}` : days.join(', ');
  return [{ days: label, time: m[2].trim() }];
}

function parseFacility(html, url) {
  const lines = toLines(html);

  const district = fieldAfter(lines, 'District');
  if (!district || !KEEP_DISTRICTS.some((re) => re.test(district))) return null;

  // The <h1> is the facility name; it is also the first line ending in the
  // site suffix, so take it from <title> and strip that suffix.
  const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? '';
  const name = title.split('|')[0].trim();
  if (!name || EXCLUDE.test(name)) return null;

  const locate = fieldAfter(lines, 'Locate');
  const coords = locate?.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!coords) return null;

  const lat = Number(coords[1]);
  const lng = Number(coords[2]);

  const rawAddress = fieldAfter(lines, 'Address');
  const locationName = fieldAfter(lines, 'Location name');
  // "Albertinia, Albertinia" is the town repeated; keep it once.
  const place = locationName
    ? [...new Set(locationName.split(',').map((p) => p.trim()).filter(Boolean))].join(', ')
    : undefined;
  const address = [rawAddress?.replace(/\s+,/g, ',').trim(), place]
    .filter(Boolean)
    .join(', ') || undefined;

  return {
    name,
    category: categoryOf(name),
    lat,
    lng,
    address,
    phone: formatPhone(fieldAfter(lines, 'Telephone')),
    email: fieldAfter(lines, 'Email'),
    hours: parseHours(fieldAfter(lines, 'Operating Hours')),
    website: url,
  };
}

const ts = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

async function main() {
  console.log('Fetching facility index…');
  const index = await getText(INDEX);
  const paths = [...new Set(
    [...index.matchAll(/href="(\/health-wellness\/facility\/[a-z0-9-]+)"/g)].map((m) => m[1])
  )];
  console.log(`  ${paths.length} facility pages listed\n`);

  const kept = [];
  let skippedDistrict = 0;
  let failed = 0;

  for (const [i, path] of paths.entries()) {
    const url = `${ORIGIN}${path}`;
    try {
      const facility = parseFacility(await getText(url), url);
      if (!facility) {
        skippedDistrict += 1;
      } else {
        const town = TOWNS
          .map((t) => ({ t, d: haversineKm(facility.lat, facility.lng, t.lat, t.lng) }))
          .sort((a, b) => a.d - b.d)[0];
        if (town && town.d <= MAX_TOWN_KM) {
          kept.push({ ...facility, town: town.t.slug, distance: town.d });
          console.log(`  keep  ${facility.name} → ${town.t.label} (${town.d.toFixed(1)}km)`);
        } else {
          skippedDistrict += 1;
        }
      }
    } catch (err) {
      failed += 1;
      console.warn(`  fail  ${path}: ${err.message}`);
    }
    if ((i + 1) % 50 === 0) console.log(`  … ${i + 1}/${paths.length}`);
    await sleep(DELAY_MS);
  }

  kept.sort((a, b) => a.town.localeCompare(b.town) || a.name.localeCompare(b.name));

  const entries = kept
    .map((f, i) => {
      const lines = [
        `    id: ${ts(`wcgov-${i + 1}`)},`,
        `    name: ${ts(f.name)},`,
        `    category: ${ts(f.category)},`,
        `    town: ${ts(f.town)},`,
      ];
      if (f.address) lines.push(`    address: ${ts(f.address)},`);
      if (f.phone) lines.push(`    phone: ${ts(f.phone)},`);
      if (f.email) lines.push(`    email: ${ts(f.email)},`);
      if (f.hours?.length) {
        const rows = f.hours.map((h) => `{ days: ${ts(h.days)}, time: ${ts(h.time)} }`).join(', ');
        lines.push(`    hours: [${rows}],`);
      }
      lines.push(`    website: ${ts(f.website)},`);
      lines.push(`    logo: 'logos/western-cape-gov.png',`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  const file = `import type { MedicalFacility } from './medical';

// Generated by scripts/import-public-health.mjs from the Western Cape
// Government health facility directory — do not edit by hand.
//
// These are the provincial clinics, community day centres and district
// hospitals. They are the only medical listing that exists at all in the
// smaller towns: OpenStreetMap has nothing there and the pharmacy chains do
// not operate there.
//
// Source: https://www.westerncape.gov.za/health-wellness/facility
export const PUBLIC_HEALTH: MedicalFacility[] = [
${entries},
];
`;

  await writeFile(OUT_FILE, file, 'utf8');

  const towns = new Set(kept.map((f) => f.town));
  console.log(
    `\nWrote ${kept.length} facilities across ${towns.size} towns.` +
      `\n  skipped (other district / too far): ${skippedDistrict}` +
      `\n  failed: ${failed}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
