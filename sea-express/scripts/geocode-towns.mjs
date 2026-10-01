/**
 * Regenerates lib/garden-route/towns.ts from the town list below, geocoding
 * each one through OpenStreetMap's Nominatim service.
 *
 * Coordinates matter: every import script assigns a listing to its nearest
 * town within RADIUS_KM, so a coordinate that is a few km out silently files
 * shops under the wrong town. Geocoding beats typing them by hand.
 *
 * The list covers the seven local municipalities of the Garden Route District
 * (Mossel Bay, George, Knysna, Bitou, Hessequa, Kannaland, Oudtshoorn) plus
 * Storms River, which sits just over the Eastern Cape border but is part of
 * the Garden Route as travellers use the term. Hamlets with no shops or
 * services of their own are deliberately left out — an empty town page is
 * worse than no page.
 *
 * Nominatim asks for max 1 request/second and a real User-Agent; both are
 * honoured below.
 *
 * Run:  node scripts/geocode-towns.mjs
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, '..', 'lib', 'garden-route', 'towns.ts');

const USER_AGENT =
  'sea-express-garden-route/1.0 (town gazetteer build; OSM ODbL; contact via app listing)';

/**
 * `query` is what Nominatim is asked for; `label` is what the app shows.
 * `prefix` seeds generated listing ids and must stay stable — changing one
 * renumbers every listing in that town on the next import.
 */
const TOWNS = [
  // Mossel Bay municipality
  { slug: 'mossel-bay', prefix: 'mb', label: 'Mossel Bay', query: 'Mossel Bay' },
  { slug: 'hartenbos', prefix: 'hart', label: 'Hartenbos', query: 'Hartenbos' },
  { slug: 'great-brak-river', prefix: 'gbr', label: 'Great Brak River', query: 'Great Brak River' },
  { slug: 'herbertsdale', prefix: 'herb', label: 'Herbertsdale', query: 'Herbertsdale' },

  // George municipality
  { slug: 'george', prefix: 'geo', label: 'George', query: 'George, Western Cape' },
  { slug: 'herolds-bay', prefix: 'hb', label: 'Herolds Bay', query: 'Herolds Bay' },
  { slug: 'wilderness', prefix: 'wild', label: 'Wilderness', query: 'Wilderness, Western Cape' },
  { slug: 'uniondale', prefix: 'uni', label: 'Uniondale', query: 'Uniondale, Western Cape' },
  { slug: 'haarlem', prefix: 'haar', label: 'Haarlem', query: 'Haarlem, Western Cape' },

  // Knysna municipality
  { slug: 'sedgefield', prefix: 'sedge', label: 'Sedgefield', query: 'Sedgefield, Western Cape' },
  { slug: 'knysna', prefix: 'kny', label: 'Knysna', query: 'Knysna' },
  { slug: 'brenton-on-sea', prefix: 'bren', label: 'Brenton-on-Sea', query: 'Brenton-on-Sea' },
  { slug: 'rheenendal', prefix: 'rheen', label: 'Rheenendal', query: 'Rheenendal' },

  // Bitou municipality
  { slug: 'plett', prefix: 'plett', label: 'Plettenberg Bay', query: 'Plettenberg Bay' },
  { slug: 'keurboomstrand', prefix: 'keur', label: 'Keurboomstrand', query: 'Keurboomstrand' },
  { slug: 'natures-valley', prefix: 'natv', label: "Nature's Valley", query: "Nature's Valley, Western Cape" },
  { slug: 'wittedrift', prefix: 'witd', label: 'Wittedrift', query: 'Wittedrift' },
  { slug: 'storms-river', prefix: 'storm', label: 'Storms River', query: 'Storms River, Eastern Cape' },

  // Oudtshoorn municipality
  { slug: 'oudtshoorn', prefix: 'oudt', label: 'Oudtshoorn', query: 'Oudtshoorn' },
  { slug: 'de-rust', prefix: 'derust', label: 'De Rust', query: 'De Rust, Western Cape' },
  { slug: 'dysselsdorp', prefix: 'dyss', label: 'Dysselsdorp', query: 'Dysselsdorp' },

  // Kannaland municipality
  { slug: 'calitzdorp', prefix: 'cal', label: 'Calitzdorp', query: 'Calitzdorp' },
  { slug: 'ladismith', prefix: 'lad', label: 'Ladismith', query: 'Ladismith, Western Cape' },
  { slug: 'zoar', prefix: 'zoar', label: 'Zoar', query: 'Zoar, Western Cape' },
  { slug: 'van-wyksdorp', prefix: 'vwd', label: 'Van Wyksdorp', query: 'Van Wyksdorp' },

  // Hessequa municipality
  { slug: 'riversdale', prefix: 'riv', label: 'Riversdale', query: 'Riversdale, Western Cape' },
  { slug: 'stilbaai', prefix: 'stil', label: 'Still Bay', query: 'Stilbaai' },
  { slug: 'jongensfontein', prefix: 'jong', label: 'Jongensfontein', query: 'Jongensfontein' },
  { slug: 'heidelberg', prefix: 'heid', label: 'Heidelberg', query: 'Heidelberg, Western Cape' },
  { slug: 'albertinia', prefix: 'alb', label: 'Albertinia', query: 'Albertinia' },
  { slug: 'witsand', prefix: 'wits', label: 'Witsand', query: 'Witsand, Western Cape' },
  { slug: 'gouritsmond', prefix: 'gour', label: 'Gouritsmond', query: 'Gouritsmond' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function geocode(town) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', `${town.query}, South Africa`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'za');

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`${town.label}: ${res.status} ${res.statusText}`);
  const [hit] = await res.json();
  if (!hit) return null;
  return { lat: Number(Number(hit.lat).toFixed(4)), lng: Number(Number(hit.lon).toFixed(4)) };
}

async function main() {
  console.log(`Geocoding ${TOWNS.length} Garden Route towns…`);
  const resolved = [];
  for (const town of TOWNS) {
    try {
      const point = await geocode(town);
      if (point) {
        resolved.push({ ...town, ...point });
        console.log(`  ok    ${town.label.padEnd(20)} ${point.lat}, ${point.lng}`);
      } else {
        console.warn(`  MISS  ${town.label} — no Nominatim result, skipped`);
      }
    } catch (err) {
      console.warn(`  FAIL  ${town.label} — ${err.message}`);
    }
    await sleep(1100); // Nominatim usage policy: at most 1 request/second.
  }

  // West to east, which is how the Garden Route is travelled and read.
  resolved.sort((a, b) => a.lng - b.lng);

  const rows = resolved
    .map(
      (t) =>
        `  { slug: '${t.slug}', prefix: '${t.prefix}', lat: ${t.lat}, lng: ${t.lng}, label: ${JSON.stringify(t.label)} },`
    )
    .join('\n');

  await writeFile(
    OUT_FILE,
    `// Generated by scripts/geocode-towns.mjs — do not edit by hand.
// Coordinates from OpenStreetMap Nominatim, © OpenStreetMap contributors.
// Ordered west to east, the way the Garden Route is travelled.
//
// Every import script reads this file (via scripts/lib/towns.mjs) and assigns
// each listing to its nearest town, so these coordinates decide which town a
// shop appears under. \`prefix\` seeds generated listing ids and must stay
// stable.
export const TOWNS = [
${rows}
];

export type Town = (typeof TOWNS)[number];

export function getTownLabel(slug: string): string {
  return TOWNS.find((t) => t.slug === slug)?.label ?? slug;
}
`,
    'utf8'
  );

  console.log(`\nWrote ${resolved.length} towns to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
