/**
 * One-time import of Garden Route small businesses from OpenStreetMap (Overpass API).
 *
 * Fetches shops, crafts and small offices (excluding estate agents, which are
 * covered by scripts/import-agencies.mjs) in the Garden Route bounding box,
 * assigns each to the nearest of our 6 towns (within RADIUS_KM), and
 * regenerates lib/garden-route/businesses.ts.
 *
 * Mirrors scripts/import-agencies.mjs / import-medical.mjs / import-restaurants.mjs.
 *
 * Run:  node scripts/import-businesses.mjs
 *
 * OSM data is © OpenStreetMap contributors, licensed under the ODbL.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'businesses.ts');

// Garden Route bounding box: south, west, north, east.
const BBOX = [-34.45, 21.9, -33.7, 24.1];

// Only keep businesses within this distance of one of our towns (km).
const RADIUS_KM = 12;

// Towns (kept in sync with lib/garden-route/towns.ts), with id prefixes.
const TOWNS = [
  { slug: 'mossel-bay', prefix: 'mb', lat: -34.1814, lng: 22.146 },
  { slug: 'george', prefix: 'geo', lat: -33.963, lng: 22.4617 },
  { slug: 'wilderness', prefix: 'wild', lat: -33.9989, lng: 22.58 },
  { slug: 'sedgefield', prefix: 'sedge', lat: -34.0146, lng: 22.7939 },
  { slug: 'knysna', prefix: 'kny', lat: -34.0363, lng: 23.0471 },
  { slug: 'plett', prefix: 'plett', lat: -34.0527, lng: 23.3716 },
];

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const USER_AGENT =
  'sea-express-garden-route/1.0 (one-time small-business import; OSM ODbL)';

// Tags already covered by other directories in this app — excluded here to
// avoid duplicate listings across Restaurants / Medical / Real Estate.
const EXCLUDED_SHOP = new Set(['estate_agent']);
const EXCLUDED_AMENITY = new Set([
  'restaurant',
  'cafe',
  'fast_food',
  'bar',
  'pub',
  'hospital',
  'doctors',
  'pharmacy',
  'dentist',
  'clinic',
]);

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestTown(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const town of TOWNS) {
    const d = haversineKm(lat, lng, town.lat, town.lng);
    if (d < bestDist) {
      bestDist = d;
      best = town;
    }
  }
  return { town: best, dist: bestDist };
}

function normalizeUrl(url) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function titleCase(tag) {
  return tag
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function fetchOverpass() {
  const [s, w, n, e] = BBOX;
  const bbox = `${s},${w},${n},${e}`;
  const query = `
    [out:json][timeout:180];
    (
      node["shop"](${bbox});
      way["shop"](${bbox});
      node["craft"](${bbox});
      way["craft"](${bbox});
      node["office"](${bbox});
      way["office"](${bbox});
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

function renderFile(businesses) {
  const entries = businesses
    .map((b) => {
      const lines = [
        `    id: ${tsString(b.id)},`,
        `    name: ${tsString(b.name)},`,
        `    category: ${tsString(b.category)},`,
        `    town: ${tsString(b.town)},`,
      ];
      if (b.website) lines.push(`    website: ${tsString(b.website)},`);
      if (b.phone) lines.push(`    phone: ${tsString(b.phone)},`);
      lines.push(`    lat: ${b.lat},`);
      lines.push(`    lng: ${b.lng},`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  return `export interface Business {
  id: string;
  name: string;
  category: string;
  town: string;
  website?: string;
  phone?: string;
  lat: number;
  lng: number;
}

// Generated from OpenStreetMap via scripts/import-businesses.mjs.
// Data © OpenStreetMap contributors (ODbL). Do not edit by hand — re-run the script.
export const BUSINESSES: Business[] = [
${entries},
];

export const BUSINESS_CATEGORIES: string[] = Array.from(
  new Set(BUSINESSES.map((b) => b.category))
).sort();

export function getBusinessesByTown(town: string): Business[] {
  return BUSINESSES.filter((b) => b.town === town);
}

export function getBusinessMapsUrl(business: Business): string {
  return \`https://www.google.com/maps/search/\${encodeURIComponent(business.name)}/@\${business.lat},\${business.lng},16z\`;
}
`;
}

async function main() {
  console.log('Querying Overpass for Garden Route small businesses…');
  const elements = await fetchOverpass();
  console.log(`Overpass returned ${elements.length} raw elements.`);

  const perTownCount = {};
  const seen = new Set();
  const businesses = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || tags.brand || '').trim();
    if (!name) continue;

    const shop = tags.shop;
    const craft = tags.craft;
    const office = tags.office;

    if (shop && EXCLUDED_SHOP.has(shop)) continue;
    if (office && EXCLUDED_SHOP.has(office)) continue;
    if (tags.amenity && EXCLUDED_AMENITY.has(tags.amenity)) continue;

    const rawCategory = shop || craft || office;
    if (!rawCategory) continue;
    if (rawCategory === 'yes' || rawCategory === 'no') continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const { town, dist } = nearestTown(lat, lng);
    if (!town || dist > RADIUS_KM) continue;

    const dedupeKey = `${name.toLowerCase()}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    perTownCount[town.slug] = (perTownCount[town.slug] || 0) + 1;
    const id = `${town.prefix}-${perTownCount[town.slug]}`;

    businesses.push({
      id,
      name,
      category: titleCase(rawCategory),
      town: town.slug,
      website: normalizeUrl(tags.website || tags['contact:website']),
      phone: (tags.phone || tags['contact:phone'] || '').trim() || undefined,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
  }

  const townOrder = Object.fromEntries(TOWNS.map((t, i) => [t.slug, i]));
  businesses.sort(
    (a, b) =>
      townOrder[a.town] - townOrder[b.town] || a.name.localeCompare(b.name)
  );

  await writeFile(OUT_FILE, renderFile(businesses), 'utf8');

  console.log(`\nWrote ${businesses.length} businesses to ${OUT_FILE}`);
  for (const town of TOWNS) {
    console.log(`  ${town.slug.padEnd(12)} ${perTownCount[town.slug] || 0}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
