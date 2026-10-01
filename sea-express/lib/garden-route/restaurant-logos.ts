import { RESTAURANTS, type Restaurant } from './restaurants';
import { SITE_LOGOS } from './site-logos';
import { DISCOVERED_SITES } from './discovered-sites';
import { BRAND_LOGOS } from './brand-logos';
import { logoFirst } from './display';
import { getSuppliedLogo } from './supplied-logos';



/**
 * Resolution order, matching the other directories:
 *  1. a hand-supplied logo matched by name,
 *  2. a national brand already in the shared brand table,
 *  3. the logo downloaded from the venue's own website, keyed by domain,
 *  4. nothing — the card falls back to a monogram in components/BrandMark.
 */
export function getRestaurantLogo(restaurant: Restaurant): string | undefined {
  const supplied = getSuppliedLogo(restaurant.name);
  if (supplied) return supplied;

  const brand = BRAND_LOGOS.find((b) => b.pattern.test(restaurant.name))?.logo;
  if (brand) return brand;

  // A website the import recorded, or one discover-websites.mjs found and
  // verified for a listing that had none.
  const site = restaurant.website ?? DISCOVERED_SITES.get(restaurant.name);
  if (!site) return undefined;
  try {
    const host = new URL(site).hostname.replace(/^www\./, '');
    return SITE_LOGOS.get(host);
  } catch {
    // Malformed URL in the OSM import — treat as no website.
    return undefined;
  }
}

/** Every restaurant, with branded listings sorted to the front. */
export const VISIBLE_RESTAURANTS = logoFirst(RESTAURANTS, getRestaurantLogo);
