/**
 * One-time import of Garden Route medical facilities from OpenStreetMap
 * (Overpass API).
 *
 * Fetches hospitals, clinics, doctors, dentists, pharmacies, opticians and
 * allied healthcare in the Garden Route bounding box, assigns each to the
 * nearest of our 6 towns (within RADIUS_KM), and regenerates
 * lib/garden-route/medical-osm.ts.
 *
 * Writes to medical-osm.ts, NOT medical.ts: medical.ts holds hand-verified
 * listings (hospital switchboards, Arrie Nel branches) whose numbers were
 * checked against each operator's own site, and merges this generated set in
 * underneath them. Regenerating therefore never clobbers curated data.
 *
 * Mirrors scripts/import-businesses.mjs / import-accommodation.mjs.
 *
 * Run:  node scripts/import-medical.mjs
 *
 * OSM data is © OpenStreetMap contributors, licensed under the ODbL.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOWNS, boundingBox, nearestTown } from './lib/towns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'medical-osm.ts');

// Bounding box is derived from the town gazetteer, so adding a town in
// scripts/geocode-towns.mjs widens this automatically.
const BBOX = boundingBox();

// Only keep facilities within this distance of one of our towns (km).
const RADIUS_KM = 12;


const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const USER_AGENT =
  'sea-express-garden-route/1.0 (one-time medical-directory import; OSM ODbL)';

/**
 * OSM tag → our category. Order matters: the first match on an element wins,
 * so amenity is checked before the looser healthcare=* tag.
 */
const AMENITY_CATEGORY = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  doctors: 'Doctor',
  dentist: 'Dentist',
  pharmacy: 'Pharmacy',
};

const HEALTHCARE_CATEGORY = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  centre: 'Clinic',
  doctor: 'Doctor',
  dentist: 'Dentist',
  pharmacy: 'Pharmacy',
  optometrist: 'Optometrist',
  physiotherapist: 'Physiotherapist',
  laboratory: 'Laboratory',
  psychotherapist: 'Psychologist',
  audiologist: 'Audiologist',
  podiatrist: 'Podiatrist',
  dietitian: 'Dietitian',
  midwife: 'Midwife',
  occupational_therapist: 'Occupational Therapist',
  speech_therapist: 'Speech Therapist',
  nurse: 'Nursing',
  birthing_centre: 'Birthing Centre',
  rehabilitation: 'Rehabilitation',
  sample_collection: 'Laboratory',
  blood_donation: 'Blood Donation',
};

const SHOP_CATEGORY = {
  optician: 'Optometrist',
  hearing_aids: 'Audiologist',
  chemist: 'Chemist',
  medical_supply: 'Medical Supplies',
};

// Animal care is not part of a human medical directory. The name check
// catches practices tagged as ordinary healthcare (e.g. a physiotherapist)
// that are actually veterinary, which the tag alone does not reveal.
const EXCLUDED_AMENITY = new Set(['veterinary']);
const EXCLUDED_HEALTHCARE = new Set(['veterinary']);
const EXCLUDED_NAME = /veterinar|animal (hospital|clinic)/i;

function normalizeUrl(url) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Builds a street address from the OSM addr:* tags, where they exist. */
function buildAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']]
    .filter(Boolean)
    .join(' ');
  const parts = [
    street || undefined,
    tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}

const DAY_NAMES = {
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
  Su: 'Sun',
  PH: 'Public holidays',
};

/**
 * Light parse of OSM's opening_hours syntax into our {days, time} rows, e.g.
 * "Mo-Fr 08:00-17:00; Sa 08:00-13:00" → two rows. Anything that does not fit
 * the common "<days> <times>" shape is passed through verbatim rather than
 * guessed at — a wrong pharmacy closing time is worse than an ugly one.
 */
function parseOpeningHours(raw) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (value === '24/7') return [{ days: 'Every day', time: 'Open 24 hours' }];

  const rows = [];
  for (const part of value.split(';')) {
    const chunk = part.trim();
    if (!chunk) continue;
    const match = chunk.match(/^([A-Za-z]{2}(?:[-,][A-Za-z]{2})*)\s+(.+)$/);
    if (!match) {
      rows.push({ days: 'Hours', time: chunk });
      continue;
    }
    const [, dayPart, timePart] = match;
    const days = dayPart.replace(/[A-Za-z]{2}/g, (d) => DAY_NAMES[d] ?? d);
    const time = timePart.replace(/,/g, ', ').replace(/off/i, 'Closed').trim();
    rows.push({ days, time });
  }
  return rows.length ? rows : undefined;
}

async function fetchOverpass() {
  const [s, w, n, e] = BBOX;
  const bbox = `${s},${w},${n},${e}`;
  const query = `
    [out:json][timeout:180];
    (
      node["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](${bbox});
      way["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](${bbox});
      node["healthcare"](${bbox});
      way["healthcare"](${bbox});
      node["shop"~"^(optician|hearing_aids|chemist|medical_supply)$"](${bbox});
      way["shop"~"^(optician|hearing_aids|chemist|medical_supply)$"](${bbox});
    );
    out center tags;
  `;
  let lastErr;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      return json.elements || [];
    } catch (err) {
      lastErr = err;
      console.warn(`  endpoint ${url} failed: ${err.message} — trying next…`);
    }
  }
  throw new Error(`All Overpass endpoints failed. Last error: ${lastErr?.message}`);
}

function tsString(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function renderFile(facilities) {
  const entries = facilities
    .map((f) => {
      const lines = [
        `    id: ${tsString(f.id)},`,
        `    name: ${tsString(f.name)},`,
        `    category: ${tsString(f.category)},`,
        `    town: ${tsString(f.town)},`,
      ];
      if (f.address) lines.push(`    address: ${tsString(f.address)},`);
      if (f.phone) lines.push(`    phone: ${tsString(f.phone)},`);
      if (f.email) lines.push(`    email: ${tsString(f.email)},`);
      if (f.website) lines.push(`    website: ${tsString(f.website)},`);
      if (f.hours) {
        const rows = f.hours
          .map((h) => `      { days: ${tsString(h.days)}, time: ${tsString(h.time)} },`)
          .join('\n');
        lines.push(`    hours: [\n${rows}\n    ],`);
      }
      lines.push(`    lat: ${f.lat},`);
      lines.push(`    lng: ${f.lng},`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  return `import type { MedicalFacility } from './medical';

// Generated from OpenStreetMap via scripts/import-medical.mjs.
// Data © OpenStreetMap contributors (ODbL). Do not edit by hand — re-run the
// script. Hand-verified listings live in medical.ts and take precedence over
// anything here.
export const OSM_MEDICAL: MedicalFacility[] = [
${entries},
];
`;
}

async function main() {
  console.log('Querying Overpass for Garden Route medical facilities…');
  const elements = await fetchOverpass();
  console.log(`Overpass returned ${elements.length} raw elements.`);

  const perTownCount = {};
  const perCategoryCount = {};
  const seen = new Set();
  const facilities = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || tags.brand || '').trim();
    if (!name) continue;

    if (tags.amenity && EXCLUDED_AMENITY.has(tags.amenity)) continue;
    if (tags.healthcare && EXCLUDED_HEALTHCARE.has(tags.healthcare)) continue;
    if (EXCLUDED_NAME.test(name)) continue;

    const category =
      AMENITY_CATEGORY[tags.amenity] ??
      HEALTHCARE_CATEGORY[tags.healthcare] ??
      SHOP_CATEGORY[tags.shop];
    if (!category) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const { town, dist } = nearestTown(lat, lng);
    if (!town || dist > RADIUS_KM) continue;

    // Same facility is often mapped as both a node and a building way.
    const dedupeKey = `${name.toLowerCase()}|${town.slug}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    perTownCount[town.slug] = (perTownCount[town.slug] || 0) + 1;
    perCategoryCount[category] = (perCategoryCount[category] || 0) + 1;

    facilities.push({
      id: `osm-${town.prefix}-${perTownCount[town.slug]}`,
      name,
      category,
      town: town.slug,
      address: buildAddress(tags),
      phone: (tags.phone || tags['contact:phone'] || '').trim() || undefined,
      email: (tags.email || tags['contact:email'] || '').trim() || undefined,
      website: normalizeUrl(tags.website || tags['contact:website']),
      hours: parseOpeningHours(tags.opening_hours),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
  }

  const townOrder = Object.fromEntries(TOWNS.map((t, i) => [t.slug, i]));
  facilities.sort(
    (a, b) => townOrder[a.town] - townOrder[b.town] || a.name.localeCompare(b.name)
  );

  await writeFile(OUT_FILE, renderFile(facilities), 'utf8');

  console.log(`\nWrote ${facilities.length} facilities to ${OUT_FILE}`);
  console.log('\nBy town:');
  for (const town of TOWNS) {
    console.log(`  ${town.slug.padEnd(12)} ${perTownCount[town.slug] || 0}`);
  }
  console.log('\nBy category:');
  for (const [cat, n] of Object.entries(perCategoryCount).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(22)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
