/**
 * Imports chain-pharmacy branches from the chains' own store finders and
 * regenerates lib/garden-route/pharmacies.ts.
 *
 * Why this exists alongside import-medical.mjs: OpenStreetMap's healthcare
 * coverage in the Garden Route is patchy, and the listings it does have for
 * chains are often unnamed nodes. The chains publish their own branch data,
 * which is authoritative for name, address and trading hours, and lets each
 * listing carry a real brand logo instead of a monogram.
 *
 * Sources
 *   Clicks    — /store-finder/position returns a `data-stores` JSON blob.
 *               `feature=pharmacy` restricts it to branches with a dispensary,
 *               which matters because plenty of Clicks stores have none.
 *   Dis-Chem  — NOT included. Its store locator answers 403 behind bot
 *               protection; that is an explicit "do not scrape", so it is
 *               left alone rather than worked around. Its branches have to be
 *               added by hand if they are wanted.
 *
 * A branch is only kept when it is within IN_TOWN_KM of one of our towns.
 * That radius is deliberately tight. The nearest Clicks to Wilderness sits
 * 7km away in a George mall, and to Great Brak River 11km away in Mossel
 * Bay — filing those under Wilderness or Great Brak would tell someone a
 * pharmacy is in their village when it is a drive away. An empty town is
 * better than a wrong listing.
 *
 * Run:  node scripts/import-pharmacies.mjs
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOWNS, haversineKm } from './lib/towns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'pharmacies.ts');

/** Only keep a branch this close to the town centre (km). See header. */
const IN_TOWN_KM = 6;

/** Polite pacing between requests to someone else's site (ms). */
const DELAY_MS = 2500;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const CLICKS = {
  id: 'clicks',
  name: 'Clicks',
  logo: 'logos/clicks.png',
  origin: 'https://clicks.co.za',
};

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

/**
 * The `name` field of each store is a chunk of HTML — an <a> wrapping the
 * branch name and address lines as sibling <div>s. Splitting on tags gives
 * those lines back in order: [branch, street, suburb, "Town, Province",
 * postcode, country].
 */
function parseStoreName(html) {
  const parts = html
    .replace(/<[^>]+>/g, '|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  const [branch, ...rest] = parts;
  // The suburb line and the "Town, Province" line often repeat the town
  // ("George" then "George, Western Cape"), which reads as a typo on the
  // card. Drop any part already contained in the one after it.
  const lines = rest.filter((p) => p !== 'South Africa');
  const address = lines
    .filter((part, i) => {
      const next = lines[i + 1];
      return !next || !next.toLowerCase().includes(part.toLowerCase());
    })
    .join(', ');
  return { branch, address };
}

function parseStoreUrl(html) {
  const m = html.match(/href=([^\s>]+)/);
  if (!m) return undefined;
  const path = m[1].replace(/^['"]|['"]$/g, '').split('?')[0];
  return path.startsWith('/') ? `${CLICKS.origin}${path}` : undefined;
}

async function fetchClicksNear(lat, lng) {
  const url = `${CLICKS.origin}/store-finder/position?latitude=${lat}&longitude=${lng}&page=0&feature=pharmacy`;
  const html = await getText(url);
  const m = html.match(/data-stores='([^']+)'/);
  if (!m) return [];
  let blob;
  try {
    blob = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
  } catch {
    return [];
  }
  return Object.values(blob)
    .map((store) => {
      const lat2 = Number(store.latitude);
      const lng2 = Number(store.longitude);
      if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) return null;
      const { branch, address } = parseStoreName(store.name ?? '');
      if (!branch) return null;
      return { branch, address, lat: lat2, lng: lng2, website: parseStoreUrl(store.name ?? '') };
    })
    .filter(Boolean);
}

const ts = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

async function main() {
  // Keyed by rounded coordinates: the same branch is returned by several
  // neighbouring town queries, and it has no stable id in this payload.
  const byLocation = new Map();

  for (const town of TOWNS) {
    let found = [];
    try {
      found = await fetchClicksNear(town.lat, town.lng);
    } catch (err) {
      console.warn(`  warn  ${town.label}: ${err.message}`);
      await sleep(DELAY_MS);
      continue;
    }

    const inTown = found.filter(
      (s) => haversineKm(s.lat, s.lng, town.lat, town.lng) <= IN_TOWN_KM
    );

    for (const store of inTown) {
      const key = `${store.lat.toFixed(4)},${store.lng.toFixed(4)}`;
      const existing = byLocation.get(key);
      const distance = haversineKm(store.lat, store.lng, town.lat, town.lng);
      // Several towns can be inside IN_TOWN_KM of one branch; the closest wins.
      if (!existing || distance < existing.distance) {
        byLocation.set(key, { ...store, town: town.slug, distance });
      }
    }

    console.log(
      `  ${town.label.padEnd(18)} returned ${String(found.length).padStart(2)}, within ${IN_TOWN_KM}km: ${inTown.length}`
    );
    await sleep(DELAY_MS);
  }

  const stores = [...byLocation.values()].sort(
    (a, b) => a.town.localeCompare(b.town) || a.branch.localeCompare(b.branch)
  );

  // Chains name several branches after the town itself, so a town can end up
  // with two identical cards ("Clicks George" twice, at opposite ends of
  // George). Where that happens, tag each with its street or suburb.
  const nameCounts = new Map();
  for (const s of stores) {
    const key = `${s.town}|${s.branch}`;
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }
  for (const s of stores) {
    if (nameCounts.get(`${s.town}|${s.branch}`) > 1) {
      const where = (s.address ?? '').split(',')[0]?.trim();
      if (where) s.branch = `${s.branch} (${where})`;
    }
  }

  const entries = stores
    .map((s, i) => {
      const lines = [
        `    id: ${ts(`${CLICKS.id}-${i + 1}`)},`,
        `    name: ${ts(`${CLICKS.name} ${s.branch}`)},`,
        `    category: 'Pharmacy',`,
        `    town: ${ts(s.town)},`,
      ];
      if (s.address) lines.push(`    address: ${ts(s.address)},`);
      if (s.website) lines.push(`    website: ${ts(s.website)},`);
      lines.push(`    logo: ${ts(CLICKS.logo)},`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  const file = `import type { MedicalFacility } from './medical';

// Generated by scripts/import-pharmacies.mjs from the chains' own store
// finders — do not edit by hand. Re-run the script to refresh.
//
// Only branches within ${IN_TOWN_KM}km of a town centre are included, so a mall
// branch in the next town over never appears under a village that has no
// pharmacy of its own.
export const CHAIN_PHARMACIES: MedicalFacility[] = [
${entries},
];
`;

  await writeFile(OUT_FILE, file, 'utf8');

  const towns = new Set(stores.map((s) => s.town));
  console.log(`\nWrote ${stores.length} branches across ${towns.size} towns to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
