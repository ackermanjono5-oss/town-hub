/**
 * Single source of truth for the town gazetteer used by every import script.
 *
 * lib/garden-route/towns.ts is TypeScript that the app imports directly, and
 * the importers are plain .mjs, so this parses the generated array out of it
 * rather than keeping a second copy. Each importer used to hardcode its own
 * TOWNS list, which meant adding a town silently left the older scripts
 * assigning listings against a stale gazetteer.
 *
 * Regenerate towns.ts with: node scripts/geocode-towns.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOWNS_FILE = join(__dirname, '..', '..', 'lib', 'garden-route', 'towns.ts');

const ROW =
  /\{\s*slug:\s*'([^']+)',\s*prefix:\s*'([^']+)',\s*lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+),\s*label:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;

export const TOWNS = [...readFileSync(TOWNS_FILE, 'utf8').matchAll(ROW)].map((m) => ({
  slug: m[1],
  prefix: m[2],
  lat: Number(m[3]),
  lng: Number(m[4]),
  label: JSON.parse(`"${m[5]}"`),
}));

if (TOWNS.length === 0) {
  throw new Error(`Parsed no towns from ${TOWNS_FILE} — has its format changed?`);
}

/**
 * Bounding box for Overpass queries, derived from the gazetteer plus a margin
 * so a listing just outside a town still gets picked up. Computed rather than
 * hardcoded, so adding a town widens the search area automatically.
 * Returns [south, west, north, east].
 */
export function boundingBox(marginDeg = 0.25) {
  const lats = TOWNS.map((t) => t.lat);
  const lngs = TOWNS.map((t) => t.lng);
  return [
    Math.min(...lats) - marginDeg,
    Math.min(...lngs) - marginDeg,
    Math.max(...lats) + marginDeg,
    Math.max(...lngs) + marginDeg,
  ];
}

export function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestTown(lat, lng) {
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
