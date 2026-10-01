/**
 * Finds the website for listings that do not have one, by guessing the
 * obvious domains and then proving the page really belongs to that business.
 *
 * The OpenStreetMap import only carries a website where a mapper happened to
 * add one, so most listings have none and therefore no logo to fetch. Most
 * small businesses do have a site at the obvious address, so this tries
 * `<name>.co.za`, `<name>.com` and a couple of variants, fetches each, and
 * keeps it only if the page proves it belongs to that business.
 *
 * Verification is the whole point. A guessed domain very often resolves to a
 * parked page, a registrar holding page, or an unrelated company with a
 * similar name — any of which would attach a wrong logo to a real business.
 * So a candidate is accepted only when a distinctive word from the listing
 * name appears in the page's own title or text, and no parking marker does.
 *
 * Writes lib/garden-route/discovered-sites.ts. Nothing is written into the
 * generated import files, so re-importing from OSM never clobbers this and
 * this never clobbers a mapper-supplied website.
 *
 * Run:  node scripts/discover-websites.mjs [--limit N] [--only restaurants]
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mapLimit, USER_AGENT } from './lib/icon-fetch.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_FILE = join(ROOT, 'lib', 'garden-route', 'discovered-sites.ts');

const SOURCES = {
  restaurants: 'lib/garden-route/restaurants.ts',
  businesses: 'lib/garden-route/businesses.ts',
  accommodation: 'lib/garden-route/accommodation.ts',
  medical: 'lib/garden-route/medical-osm.ts',
};

const CONCURRENCY = 12;
const TIMEOUT_MS = 6000;
const MAX_CANDIDATES = 4;

/** Words too generic to prove a page belongs to a particular business. */
const GENERIC = new Set([
  'the', 'and', 'for', 'shop', 'store', 'cafe', 'restaurant', 'bar', 'pub',
  'hotel', 'guest', 'house', 'lodge', 'inn', 'bed', 'breakfast', 'self',
  'catering', 'accommodation', 'garden', 'route', 'bay', 'street', 'road',
  'centre', 'center', 'group', 'services', 'service', 'company', 'trading',
  'pty', 'ltd', 'south', 'africa', 'african', 'sea', 'beach', 'river',
  'village', 'town', 'market', 'shopping', 'mall', 'plaza', 'point', 'view',
  'new', 'old', 'big', 'little', 'small', 'best', 'home', 'place', 'spot',
  // Category nouns: a listing named only these has nothing distinctive to
  // verify against, and would happily match any generic domain.
  'supermarket', 'pharmacy', 'chemist', 'butcher', 'bakery', 'barber',
  'salon', 'garage', 'hardware', 'liquor', 'bottle', 'deli', 'takeaway',
  'clinic', 'dentist', 'doctor', 'doctors', 'school', 'church', 'office',
  'studio', 'gallery', 'nursery', 'laundry', 'superette', 'grocer',
  'supermarkt', 'winkel', 'kiosk', 'depot', 'warehouse', 'factory',
]);

/** Pages that exist but belong to nobody — parked, for sale, or a registrar. */
const PARKED =
  /domain (is )?(for sale|parking)|buy this domain|this domain( name)? is for sale|parked (free )?(at|by|courtesy)|website coming soon|under construction|godaddy\.com\/domain|sedoparking|afternic|hugedomains|namecheap parking|default web site page|apache2 (ubuntu|debian) default|it works!|welcome to nginx/i;

function slugWords(name) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** The words that could prove a page belongs to this business. */
function distinctiveWords(name) {
  return slugWords(name).filter((w) => w.length >= 4 && !GENERIC.has(w));
}

function candidateDomains(name) {
  const words = slugWords(name).filter((w) => w !== 'the' && w !== 'and');
  if (words.length === 0) return [];
  const joined = words.join('');
  const hyphen = words.join('-');
  const firstTwo = words.slice(0, 2).join('');

  const bases = [...new Set([joined, hyphen, firstTwo].filter((b) => b.length >= 4 && b.length <= 40))];
  const out = [];
  for (const base of bases) {
    out.push(`${base}.co.za`, `${base}.com`);
  }
  return out.slice(0, MAX_CANDIDATES);
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-ZA,en;q=0.9',
      },
    });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? '';
    if (!/html/i.test(type)) return null;
    return { html: (await res.text()).slice(0, 120_000), finalUrl: res.url || url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Accepts a candidate only when the page identifies itself as this business:
 * a distinctive word from the listing name must appear in the title, an
 * og:site_name, or a heading — not merely somewhere in the body, which a
 * directory or aggregator page would also satisfy.
 */
function pageProvesBusiness(html, words, town) {
  if (PARKED.test(html.slice(0, 4000))) return false;

  // A name alone is not enough: "Sandy's Kitchen" or "The Anchorage" exist in
  // a dozen countries, and matching the wrong one would put a stranger's logo
  // on a real Garden Route business. The page must also place itself in the
  // region — its town, the region by name, the province, or a local dialling
  // code. Costs some hit rate and is worth it.
  const body = html.replace(/<[^>]+>/g, ' ').toLowerCase();
  const localHints = [
    town ? town.replace(/-/g, ' ') : null,
    'garden route',
    'western cape',
    'south africa',
    'tuinroete',
    'suid-kaap',
  ].filter(Boolean);
  const dialling = /\+27\s*4[0-9]|\(0\)4[0-9]|\b0(44|28|42|82|83|84|72|73|76|78|79|60|61|62|63|64|65|66|67|68)\s?\d{3}\s?\d{4}\b/;
  const looksLocal = localHints.some((h) => body.includes(h)) || dialling.test(body);
  if (!looksLocal) return false;

  const title = /<title[^>]*>([\s\S]{0,200}?)<\/title>/i.exec(html)?.[1] ?? '';
  const ogSite = /property=["']og:site_name["'][^>]*content=["']([^"']{0,120})["']/i.exec(html)?.[1] ?? '';
  const ogTitle = /property=["']og:title["'][^>]*content=["']([^"']{0,160})["']/i.exec(html)?.[1] ?? '';
  const headings = (html.match(/<h1[^>]*>([\s\S]{0,160}?)<\/h1>/gi) ?? []).join(' ');

  const haystack = `${title} ${ogSite} ${ogTitle} ${headings}`
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();

  return words.some((w) => haystack.includes(w));
}

function parseListings(src) {
  return [...src.matchAll(/name: '((?:[^'\\]|\\.)*)',([\s\S]*?)\n  \}/g)].map((m) => ({
    name: m[1].replace(/\\'/g, "'"),
    hasWebsite: /website: '/.test(m[2]),
    town: /town: '([^']+)'/.exec(m[2])?.[1],
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const limit = Number(args[args.indexOf('--limit') + 1]) || Infinity;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

  const seen = new Set();
  const targets = [];
  for (const [key, file] of Object.entries(SOURCES)) {
    if (only && key !== only) continue;
    for (const l of parseListings(await readFile(join(ROOT, file), 'utf8'))) {
      if (l.hasWebsite) continue;
      const key2 = l.name.toLowerCase();
      if (seen.has(key2)) continue;
      seen.add(key2);
      const words = distinctiveWords(l.name);
      const domains = candidateDomains(l.name);
      if (words.length === 0 || domains.length === 0) continue;
      targets.push({ ...l, words, domains });
    }
  }

  const work = targets.slice(0, limit === Infinity ? targets.length : limit);
  console.log(
    `${targets.length} listings without a website; trying ${work.length} ` +
      `(${work.reduce((n, t) => n + t.domains.length, 0)} candidate domains)…`
  );

  const found = [];
  let done = 0;
  let checked = 0;

  await mapLimit(work, CONCURRENCY, async (t) => {
    for (const domain of t.domains) {
      checked += 1;
      const page = await fetchPage(`https://${domain}/`);
      if (!page) continue;
      if (!pageProvesBusiness(page.html, t.words, t.town)) continue;
      found.push({ name: t.name, domain, town: t.town });
      console.log(`  FOUND  ${t.name}  ->  ${domain}`);
      break;
    }
    done += 1;
    if (done % 50 === 0) {
      console.log(`  …${done}/${work.length} listings, ${found.length} sites found`);
    }
  });

  found.sort((a, b) => a.name.localeCompare(b.name));
  const rows = found
    .map(
      (f) =>
        `  ['${f.name.replace(/'/g, "\\'")}', 'https://${f.domain}'],`
    )
    .join('\n');

  await writeFile(
    OUT_FILE,
    `// Generated by scripts/discover-websites.mjs — do not edit by hand.
//
// Websites found by guessing the obvious domain for a listing and then
// verifying the page identifies itself as that business (a distinctive word
// from the name must appear in its title or headings, and it must not be a
// parked page). Keyed by listing name.
//
// Kept separate from the generated import files so re-importing from
// OpenStreetMap never clobbers these, and these never override a website a
// mapper actually recorded.
export const DISCOVERED_SITES = new Map<string, string>([
${rows}
]);
`,
    'utf8'
  );

  console.log(
    `\nChecked ${checked} domains for ${work.length} listings.\n` +
      `Verified ${found.length} websites (${Math.round((found.length / work.length) * 100)}% hit rate).`
  );
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
