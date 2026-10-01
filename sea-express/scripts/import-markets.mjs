/**
 * One-time import of Garden Route markets from OpenStreetMap (Overpass API).
 *
 * Writes lib/garden-route/markets-osm.ts. The hand-written markets in
 * lib/garden-route/markets.ts stay authoritative and are merged on top,
 * because OSM records that a marketplace exists but almost never records the
 * day and time it runs — which is the single most useful thing about a
 * market.
 *
 * Run:  node scripts/import-markets.mjs
 *
 * OSM data is © OpenStreetMap contributors, licensed under the ODbL.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOWNS, boundingBox, nearestTown } from './lib/towns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'markets-osm.ts');

const BBOX = boundingBox();
const RADIUS_KM = 12;

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const USER_AGENT = 'sea-express-garden-route/1.0 (one-time market import; OSM ODbL)';

function normalizeUrl(url) {
  if (!url) return undefined;
  const t = url.trim();
  if (!t) return undefined;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

/** OSM opening_hours is the closest thing to a market's schedule. */
function schedule(tags) {
  const raw = (tags.opening_hours || '').trim();
  if (!raw) return undefined;
  if (raw === '24/7') return 'Open daily';
  return raw
    .replace(/Mo/g, 'Mon').replace(/Tu/g, 'Tue').replace(/We/g, 'Wed')
    .replace(/Th/g, 'Thu').replace(/Fr/g, 'Fri').replace(/Sa/g, 'Sat')
    .replace(/Su/g, 'Sun').replace(/;/g, ' · ');
}

function marketType(tags) {
  if (tags.amenity === 'marketplace') return 'Market';
  if (tags.shop === 'farm') return 'Farm Stall';
  if (tags.shop === 'greengrocer') return 'Produce';
  if (tags.craft) return 'Craft';
  return 'Market';
}

async function fetchOverpass() {
  const [s, w, n, e] = BBOX;
  const bbox = `${s},${w},${n},${e}`;
  const query = `
    [out:json][timeout:240];
    (
      node["amenity"="marketplace"](${bbox});
      way["amenity"="marketplace"](${bbox});
      node["shop"~"^(farm|greengrocer)$"](${bbox});
      way["shop"~"^(farm|greengrocer)$"](${bbox});
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
      return (await res.json()).elements || [];
    } catch (err) {
      lastErr = err;
      console.warn(`  endpoint ${url} failed: ${err.message} — trying next…`);
    }
  }
  throw new Error(`All Overpass endpoints failed. Last error: ${lastErr?.message}`);
}

const tsString = (v) => `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function renderFile(rows) {
  const entries = rows
    .map((m) => {
      const lines = [
        `    id: ${tsString(m.id)},`,
        `    name: ${tsString(m.name)},`,
        `    type: ${tsString(m.type)},`,
        `    town: ${tsString(m.town)},`,
      ];
      if (m.schedule) lines.push(`    schedule: ${tsString(m.schedule)},`);
      if (m.location) lines.push(`    location: ${tsString(m.location)},`);
      if (m.website) lines.push(`    website: ${tsString(m.website)},`);
      lines.push(`    lat: ${m.lat},`);
      lines.push(`    lng: ${m.lng},`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  return `import type { Market } from './markets';

// Generated from OpenStreetMap via scripts/import-markets.mjs.
// Data © OpenStreetMap contributors (ODbL). Do not edit by hand — re-run the
// script. Hand-written markets live in markets.ts and take precedence.
export const OSM_MARKETS: Market[] = [
${entries},
];
`;
}

async function main() {
  console.log('Querying Overpass for Garden Route markets…');
  const elements = await fetchOverpass();
  console.log(`Overpass returned ${elements.length} raw elements.`);

  const perTown = {};
  const seen = new Set();
  const rows = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || '').trim();
    if (!name) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const { town, dist } = nearestTown(lat, lng);
    if (!town || dist > RADIUS_KM) continue;

    const key = `${name.toLowerCase()}|${town.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    perTown[town.slug] = (perTown[town.slug] || 0) + 1;
    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');

    rows.push({
      id: `osm-${town.prefix}-m${perTown[town.slug]}`,
      name,
      type: marketType(tags),
      town: town.slug,
      schedule: schedule(tags),
      location: street || undefined,
      website: normalizeUrl(tags.website || tags['contact:website']),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
  }

  const order = Object.fromEntries(TOWNS.map((t, i) => [t.slug, i]));
  rows.sort((a, b) => order[a.town] - order[b.town] || a.name.localeCompare(b.name));

  await writeFile(OUT_FILE, renderFile(rows), 'utf8');
  console.log(`\nWrote ${rows.length} markets to ${OUT_FILE}`);
  for (const t of TOWNS) {
    if (perTown[t.slug]) console.log(`  ${t.slug.padEnd(18)} ${perTown[t.slug]}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
