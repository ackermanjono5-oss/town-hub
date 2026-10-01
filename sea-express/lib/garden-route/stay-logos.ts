import { ACCOMMODATION, type Accommodation } from './accommodation';
import { logoFirst } from './display';
import { getSuppliedLogo } from './supplied-logos';
import { SITE_LOGOS } from './site-logos';
import { DISCOVERED_SITES } from './discovered-sites';
import { BRAND_LOGOS } from './brand-logos';

/**
 * Logo resolution for a place to stay, in the same order the business
 * directory uses:
 *  1. a hotel group matched by name (Protea, Garden Court, Conrad …),
 *  2. the logo downloaded from the property's own website, keyed by domain,
 *  3. nothing — the card falls back to a monogram in components/BrandMark.
 *
 * Most Garden Route accommodation is an independent guest house or
 * backpackers, so the monogram carries the majority of listings.
 */
export function getStayLogo(stay: Accommodation): string | undefined {
  const supplied = getSuppliedLogo(stay.name);
  if (supplied) return supplied;

  const brand = BRAND_LOGOS.find((b) => b.pattern.test(stay.name))?.logo;
  if (brand) return brand;
  // A website the import recorded, or one discover-websites.mjs found and
  // verified for a listing that had none.
  const site = stay.website ?? DISCOVERED_SITES.get(stay.name);
  if (!site) return undefined;
  try {
    const host = new URL(site).hostname.replace(/^www\./, '');
    return SITE_LOGOS.get(host);
  } catch {
    // Malformed URL in the OSM import — treat as no website.
    return undefined;
  }
}

/** Every place to stay, with branded listings sorted to the front. */
export const VISIBLE_STAYS = logoFirst(ACCOMMODATION, getStayLogo);
