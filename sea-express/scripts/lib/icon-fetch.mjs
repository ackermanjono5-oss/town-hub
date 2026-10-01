/**
 * Shared logo fetching used by fetch-business-logos.mjs (local businesses,
 * keyed by their own domain) and fetch-brand-logos.mjs (national chains,
 * keyed by a curated name -> domain table).
 *
 * Reads a site's homepage, ranks the icons it advertises, downloads the best
 * one and returns it as a square PNG. Everything must be bundled because the
 * app runs offline from file:// inside a WebView.
 */

import { createHash } from 'node:crypto';
import sharp from 'sharp';

const TIMEOUT_MS = 8000;

// Large retail sites sit behind WAFs that reject anything that does not look
// like a browser, so the request mimics one. The assets fetched are the
// public icons those sites serve to every visitor.
export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const BROWSER_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-ZA,en;q=0.9',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * A site that never set its own icon serves its CMS's default — the
 * WordPress "W", a Shopify bag and so on. Those identify the platform, not
 * the business, so they are rejected.
 */
/**
 * Some sites declare a social network's or a booking platform's icon as their
 * own — a restaurant whose favicon is the Instagram glyph, a guest house
 * serving LekkeSlaap's tile. Those identify the platform, not the business,
 * and the giveaway is the same image turning up on unrelated domains.
 */
export const THIRD_PARTY_ICON =
  /instagram|facebook|fbcdn|twitter|twimg|x\.com\/favicon|linkedin|licdn|whatsapp|tiktok|pinterest|youtube|lekkeslaap|booking\.com|tripadvisor|airbnb|safarinow|nightsbridge/i;

export const CMS_DEFAULT_ICON =
  /s\.w\.org|wp-includes\/images\/w-logo|wordpress\.(org|com)\/favicon|cdn\.shopify\.com\/s\/files\/.*favicon|squarespace\.com\/favicon|static\.parastorage\.com/i;

/**
 * Content hashes of third-party glyphs that sites serve as their own icon —
 * the Instagram camera, the Airbnb mark, LekkeSlaap's tile. URL filtering
 * cannot catch these because the file is hosted on the business's own domain;
 * only the pixels give it away.
 *
 * The run reports any image that turns up on more than one unrelated domain,
 * which is how new ones get found: check the reported file, and if it is a
 * platform logo rather than a real brand, paste its hash here.
 */
export const BLOCKED_ICON_HASHES = new Set([
  '317693a3e5f8827c468b2a3c522bd280', // Instagram glyph
  '22cf25aa7afdf2e4f59870c9e5e3ca09', // Airbnb mark
  'b33f3991b4714c8e80ec1149feb48921', // LekkeSlaap tile
]);

export function iconHash(buffer) {
  return createHash('md5').update(buffer).digest('hex');
}

export function slugify(value) {
  return value
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...opts,
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, ...BROWSER_HEADERS, ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Ranks the icons a page advertises, best first. */
function iconCandidates(html, baseUrl) {
  const found = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = /rel=["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase() ?? '';
    if (!/icon/.test(rel)) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const sizes = /sizes=["'](\d+)x\d+["']/i.exec(tag)?.[1];
    // Prefer an explicitly large icon, then apple-touch (usually 180px),
    // then anything else the page declares.
    const score = sizes ? Number(sizes) : /apple-touch/.test(rel) ? 180 : 32;
    try {
      found.push({ url: new URL(href, baseUrl).href, score });
    } catch {
      // Malformed href — ignore this candidate.
    }
  }
  found.sort((a, b) => b.score - a.score);
  // Conventional paths, tried after anything the page declares. Sites built
  // with a favicon generator publish several of these even when the HTML only
  // mentions a 32px one, so checking them finds a usable logo on plenty of
  // sites that would otherwise be skipped as too small.
  for (const path of CONVENTIONAL_PATHS) {
    try {
      found.push({ url: new URL(path, baseUrl).href, score: 0 });
    } catch {
      /* ignore */
    }
  }
  return found;
}

const CONVENTIONAL_PATHS = [
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/android-chrome-512x512.png',
  '/android-chrome-192x192.png',
  '/favicon-196x196.png',
  '/logo.png',
  '/images/logo.png',
  '/assets/logo.png',
  '/favicon.ico',
];

/**
 * A site's web app manifest lists its icons with explicit sizes, and they are
 * usually far larger than the favicon declared in the HTML. Reading it is the
 * single cheapest way to turn a rejected 32px favicon into a usable 512px
 * logo, so it is checked before anything else.
 */
async function manifestCandidates(html, baseUrl) {
  const tag = (html.match(/<link\b[^>]*>/gi) ?? []).find((t) =>
    /rel=["']manifest["']/i.test(t)
  );
  const href = tag && /href=["']([^"']+)["']/i.exec(tag)?.[1];
  if (!href) return [];
  try {
    const manifestUrl = new URL(href, baseUrl).href;
    const res = await fetchWithTimeout(manifestUrl);
    if (!res.ok) return [];
    const json = JSON.parse(await res.text());
    return (json.icons ?? [])
      .map((icon) => {
        if (!icon?.src) return null;
        const size = Number(String(icon.sizes ?? '').split('x')[0]) || 64;
        try {
          return { url: new URL(icon.src, manifestUrl).href, score: size + 1000 };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);
  } catch {
    // Missing, unreachable or not valid JSON — no manifest icons.
    return [];
  }
}

/**
 * Returns { png, source, size } for the best usable icon on `domain`, or
 * null when the site is unreachable or only offers something too small to
 * read at card size.
 */
export async function fetchBestIcon(domain, { minPx = 48, outPx = 128 } = {}) {
  const bare = domain.replace(/^www\./, '');
  // Some hosts serve the site only on the apex, others only on www, and a
  // few reject the one they do not canonicalise to — so try both.
  const origins = [`https://${bare}/`, `https://www.${bare}/`];
  let candidates = [];
  let base = origins[0];
  for (const origin of origins) {
    try {
      const res = await fetchWithTimeout(origin);
      if (!res.ok) continue;
      const html = (await res.text()).slice(0, 200_000);
      base = res.url || origin;
      candidates = [...(await manifestCandidates(html, base)), ...iconCandidates(html, base)];
      if (candidates.length > 2) break;
    } catch {
      // Unreachable on this host — try the next, then the conventional paths.
    }
  }
  if (candidates.length === 0) {
    candidates = [...iconCandidates('', origins[0]), ...iconCandidates('', origins[1])];
  }

  for (const { url } of candidates.slice(0, 10)) {
    try {
      if (CMS_DEFAULT_ICON.test(url) || THIRD_PARTY_ICON.test(url)) continue;
      const res = await fetchWithTimeout(url);
      if (!res.ok) continue;
      const landed = res.url || '';
      if (CMS_DEFAULT_ICON.test(landed) || THIRD_PARTY_ICON.test(landed)) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) continue;
      const meta = await sharp(buf).metadata();
      if (!meta.width || !meta.height) continue;
      if (Math.min(meta.width, meta.height) < minPx) continue;
      const png = await sharp(buf)
        .resize({
          width: outPx,
          height: outPx,
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();
      const hash = iconHash(png);
      if (BLOCKED_ICON_HASHES.has(hash)) continue;
      return { png, source: url, size: `${meta.width}x${meta.height}`, hash };
    } catch {
      // Not an image, or sharp could not decode it — try the next candidate.
    }
  }
  return null;
}

export async function mapLimit(items, limit, fn) {
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        await fn(items[i], i);
      }
    })
  );
}
