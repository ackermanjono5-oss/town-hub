/**
 * One-time import of Garden Route restaurants, cafes, bars and takeaways from
 * OpenStreetMap (Overpass API).
 *
 * The previous restaurants.ts held 81 hand-entered Mossel Bay listings and
 * nothing for the other 31 towns, so the Restaurant Directory was empty
 * everywhere else. This regenerates it for the whole gazetteer.
 *
 * Mirrors scripts/import-businesses.mjs — same bounding box, same
 * nearest-town assignment, same ODbL attribution.
 *
 * Run:  node scripts/import-restaurants.mjs
 *
 * OSM data is © OpenStreetMap contributors, licensed under the ODbL.
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TOWNS, boundingBox, nearestTown } from './lib/towns.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'restaurants.ts');

const BBOX = boundingBox();
const RADIUS_KM = 12;

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const USER_AGENT =
  'sea-express-garden-route/1.0 (one-time restaurant import; OSM ODbL)';

/** OSM amenity/shop tag -> the category shown on the card. */
const CATEGORY = {
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  fast_food: 'Fast Food',
  bar: 'Bar',
  pub: 'Pub',
  ice_cream: 'Ice Cream',
  food_court: 'Food Court',
  biergarten: 'Pub',
};

const SHOP_CATEGORY = {
  bakery: 'Bakery',
  pastry: 'Bakery',
  deli: 'Deli',
  coffee: 'Coffee Shop',
};

function normalizeUrl(url) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Cuisine tags are lowercase and semicolon-separated: "pizza;italian". */
function prettyCuisine(raw) {
  if (!raw) return undefined;
  const parts = raw
    .split(';')
    .map((c) => c.trim().replace(/_/g, ' '))
    .filter(Boolean)
    .slice(0, 3)
    .map((c) => c.charAt(0).toUpperCase() + c.slice(1));
  return parts.length ? parts.join(', ') : undefined;
}

async function fetchOverpass() {
  const [s, w, n, e] = BBOX;
  const bbox = `${s},${w},${n},${e}`;
  const query = `
    [out:json][timeout:240];
    (
      node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|food_court|biergarten)$"](${bbox});
      way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream|food_court|biergarten)$"](${bbox});
      node["shop"~"^(bakery|pastry|deli|coffee)$"](${bbox});
      way["shop"~"^(bakery|pastry|deli|coffee)$"](${bbox});
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

function renderFile(rows) {
  const entries = rows
    .map((r) => {
      const lines = [
        `    id: ${tsString(r.id)},`,
        `    name: ${tsString(r.name)},`,
        `    category: ${tsString(r.category)},`,
        `    town: ${tsString(r.town)},`,
      ];
      if (r.cuisine) lines.push(`    cuisine: ${tsString(r.cuisine)},`);
      if (r.phone) lines.push(`    phone: ${tsString(r.phone)},`);
      if (r.website) lines.push(`    website: ${tsString(r.website)},`);
      lines.push(`    lat: ${r.lat},`);
      lines.push(`    lng: ${r.lng},`);
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  return `export type RestaurantCategory = string;

export interface Restaurant {
  id: string;
  name: string;
  category: RestaurantCategory;
  town: string;
  /** Kitchen style from OSM's cuisine tag, e.g. "Pizza, Italian". */
  cuisine?: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  /**
   * Optional premises photo, relative to /public, rendered by
   * components/DirectoryPhoto.tsx. Declared here so a re-import regenerates
   * the field instead of dropping it.
   */
  image?: string;
}

// Generated from OpenStreetMap via scripts/import-restaurants.mjs.
// Data © OpenStreetMap contributors (ODbL). Do not edit by hand — re-run the script.
export const RESTAURANTS: Restaurant[] = [
${entries},
];

export const RESTAURANT_CATEGORIES: string[] = Array.from(
  new Set(RESTAURANTS.map((r) => r.category))
).sort();

export function getRestaurantsByTown(town: string): Restaurant[] {
  return RESTAURANTS.filter((r) => r.town === town);
}

export function getRestaurantMapsUrl(restaurant: Restaurant): string {
  return \`https://www.google.com/maps/search/\${encodeURIComponent(restaurant.name)}/@\${restaurant.lat},\${restaurant.lng},16z\`;
}
`;
}

async function main() {
  console.log('Querying Overpass for Garden Route restaurants…');
  const elements = await fetchOverpass();
  console.log(`Overpass returned ${elements.length} raw elements.`);

  const perTown = {};
  const perCategory = {};
  const seen = new Set();
  const rows = [];

  for (const el of elements) {
    const tags = el.tags || {};
    const name = (tags.name || tags.brand || '').trim();
    if (!name) continue;

    const category = CATEGORY[tags.amenity] ?? SHOP_CATEGORY[tags.shop];
    if (!category) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;

    const { town, dist } = nearestTown(lat, lng);
    if (!town || dist > RADIUS_KM) continue;

    // The same venue is often mapped as both a node and a building way.
    const key = `${name.toLowerCase()}|${town.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    perTown[town.slug] = (perTown[town.slug] || 0) + 1;
    perCategory[category] = (perCategory[category] || 0) + 1;

    rows.push({
      id: `${town.prefix}-r${perTown[town.slug]}`,
      name,
      category,
      town: town.slug,
      cuisine: prettyCuisine(tags.cuisine),
      phone: (tags.phone || tags['contact:phone'] || '').trim() || undefined,
      website: normalizeUrl(tags.website || tags['contact:website']),
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    });
  }

  const townOrder = Object.fromEntries(TOWNS.map((t, i) => [t.slug, i]));
  rows.sort(
    (a, b) => townOrder[a.town] - townOrder[b.town] || a.name.localeCompare(b.name)
  );

  await writeFile(OUT_FILE, renderFile(rows), 'utf8');

  console.log(`\nWrote ${rows.length} restaurants to ${OUT_FILE}`);
  console.log('\nBy town:');
  for (const town of TOWNS) {
    console.log(`  ${town.slug.padEnd(18)} ${perTown[town.slug] || 0}`);
  }
  console.log('\nBy category:');
  for (const [c, n] of Object.entries(perCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${c.padEnd(14)} ${n}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
