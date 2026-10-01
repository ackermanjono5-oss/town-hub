import { BUSINESSES, type Business } from './businesses';
import { SITE_LOGOS } from './site-logos';
import { DISCOVERED_SITES } from './discovered-sites';
import { BRAND_LOGOS as FETCHED_BRAND_LOGOS } from './brand-logos';
import { logoFirst } from './display';
import { getSuppliedLogo } from './supplied-logos';

/**
 * The OpenStreetMap import produces ~144 distinct raw categories, most of
 * them with a single member ("Key Cutter", "Scrap Metal Art"). That is far
 * too many to offer as filter chips, so each raw category is folded into one
 * of a handful of groups for filtering while the card still shows the
 * specific category underneath the name.
 */
export type BusinessGroup =
  | 'Food & Drink'
  | 'Fashion & Beauty'
  | 'Motoring'
  | 'Home & DIY'
  | 'Tech'
  | 'Sport & Outdoor'
  | 'Shopping'
  | 'Services'
  | 'Other';

export const BUSINESS_GROUPS: BusinessGroup[] = [
  'Food & Drink',
  'Shopping',
  'Fashion & Beauty',
  'Home & DIY',
  'Motoring',
  'Tech',
  'Sport & Outdoor',
  'Services',
  'Other',
];

const GROUP_MEMBERS: Record<Exclude<BusinessGroup, 'Other'>, string[]> = {
  'Food & Drink': [
    'Supermarket', 'Convenience', 'Alcohol', 'Coffee', 'Bakery', 'Butcher', 'Deli',
    'Health Food', 'Greengrocer', 'Seafood', 'Confectionery', 'Winery', 'Brewery',
    'Distillery', 'Spices', 'Frozen Food', 'Food', 'Beverages', 'Chocolate',
    'Caterer', 'Farm', 'Nutrition Supplements', 'Kiosk', 'Tobacco', 'E Cigarette',
    'Cannabis', 'Water',
  ],
  Shopping: [
    'Mall', 'Gift', 'Department Store', 'Variety Store', 'Books', 'Stationery',
    'Art', 'Art Gallery', 'Toys', 'Second Hand', 'Charity', 'Catalogue',
    'Newspaper', 'Copyshop', 'Printing', 'Scrap Metal Art', 'Guide', 'Ticket',
    'Frame', 'Craft',
  ],
  'Fashion & Beauty': [
    'Clothes', 'Hairdresser', 'Beauty', 'Jewelry', 'Shoes', 'Leather',
    'Fashion Accessories', 'Boutique', 'Cosmetics', 'Perfumery', 'Tattoo',
    'Massage', 'Suit Hire', 'Designer Bridal Boutique', 'Tailor', 'Fabric',
    'Erotic',
  ],
  'Home & DIY': [
    'Hardware', 'Furniture', 'Houseware', 'Interior Decoration', 'Doityourself',
    'Garden Centre', 'Tiles', 'Bed', 'Lighting', 'Bathroom Furnishing',
    'Appliance', 'Upholsterer', 'Glaziery', 'Locksmith', 'Key Cutter', 'Painter',
    'Electrician', 'Plumber', 'Roofer', 'Gardener', 'Cleaning Supplies', 'Gas',
  ],
  Motoring: [
    'Car', 'Car Repair', 'Tyres', 'Car Parts', 'Motorcycle', 'Motor Spares',
    'Trailer', 'Boat',
  ],
  Tech: [
    'Mobile Phone', 'Electronics', 'Computer', 'Printer Ink', 'Camera', 'Photo',
    'Telecommunication', 'Internet Provider', 'Video', 'Second Hand Cd Sales',
    'Music',
  ],
  'Sport & Outdoor': [
    'Bicycle', 'Sports', 'Water Sports', 'Surf', 'Surfboards Shaper And Repair',
    'Scuba Diving', 'Fishing', 'Outdoor',
  ],
  Services: [
    'Laundry', 'Optician', 'Chemist', 'Lawyer', 'Money Lender', 'Investment',
    'Financial', 'Bitcoin Exchange', 'Advertising Agency', 'Consulting',
    'Company', 'Security', 'Property Management', 'Photographer', 'Signmaker',
    'Funeral Directors', 'Travel Agency', 'Psychic', 'Virtual Assistant Office',
    'Graphic Design', 'Architect', 'Engineer', 'Educational Institution',
    'Government', 'Ngo', 'Herbalist', 'Pet', 'Pet Grooming', 'Repair', 'General',
    'Agrarian',
  ],
};

const CATEGORY_TO_GROUP = new Map<string, BusinessGroup>();
for (const [group, members] of Object.entries(GROUP_MEMBERS)) {
  for (const category of members) {
    CATEGORY_TO_GROUP.set(category, group as BusinessGroup);
  }
}

/** Anything the import introduces that is not mapped above lands in "Other". */
export function getBusinessGroup(business: Business): BusinessGroup {
  return CATEGORY_TO_GROUP.get(business.category) ?? 'Other';
}

/**
 * Chains whose logo is an asset this project already owns — the adverts
 * carousel and the medical directory — rather than one fetched by
 * scripts/fetch-brand-logos.mjs. Kept separate so a re-run of that script
 * never drops them.
 */
const LOCAL_BRAND_LOGOS: { pattern: RegExp; logo: string }[] = [
  { pattern: /\bpick\s*n\s*pay\b/i, logo: 'logos/shops/pick-n-pay.png' },
  { pattern: /\b(super)?spar\b/i, logo: 'logos/shops/spar.png' },
  { pattern: /\bcheckers\b/i, logo: 'logos/shops/checkers.png' },
  { pattern: /\bwoolworths\b/i, logo: 'logos/shops/woolworths.png' },
  { pattern: /\bmr\s*price\b/i, logo: 'logos/shops/mr-price.png' },
  { pattern: /\bengen\b|\bquickshop\b/i, logo: 'logos/shops/engen.png' },
  { pattern: /\bbuco\b/i, logo: 'logos/buco.svg' },
  { pattern: /\bbuild\s*it\b/i, logo: 'logos/buildit.svg' },
  { pattern: /^clicks\b/i, logo: 'logos/clicks.png' },
  { pattern: /\bspec[-\s]?savers\b/i, logo: 'logos/specsavers.png' },
];

/**
 * Fetched brands are checked first so a more specific chain wins over a
 * broader one — "Mr Price Home" must not be claimed by the plain Mr Price
 * pattern.
 */
const BRAND_LOGOS: { pattern: RegExp; logo: string }[] = [
  ...FETCHED_BRAND_LOGOS,
  ...LOCAL_BRAND_LOGOS,
];

/**
 * Resolution order:
 *  1. a national chain matched by name (one asset serves every branch),
 *  2. the logo downloaded from the business's own website, keyed by domain,
 *  3. nothing — the card falls back to a monogram in components/BrandMark.
 */
export function getBusinessLogo(business: Business): string | undefined {
  const supplied = getSuppliedLogo(business.name);
  if (supplied) return supplied;

  const chain = BRAND_LOGOS.find((b) => b.pattern.test(business.name))?.logo;
  if (chain) return chain;
  // A website the import recorded, or one discover-websites.mjs found and
  // verified for a listing that had none.
  const site = business.website ?? DISCOVERED_SITES.get(business.name);
  if (!site) return undefined;
  try {
    const host = new URL(site).hostname.replace(/^www\./, '');
    return SITE_LOGOS.get(host);
  } catch {
    // Malformed URL in the OSM import — treat as no website.
    return undefined;
  }
}

export function countByGroup(businesses: Business[]): Map<BusinessGroup, number> {
  const counts = new Map<BusinessGroup, number>();
  for (const b of businesses) {
    const g = getBusinessGroup(b);
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return counts;
}

/** Total listings that resolve to a brand logo — used for the hero stat. */
export const BRANDED_COUNT = BUSINESSES.filter((b) => getBusinessLogo(b)).length;

/** Every business, with branded listings sorted to the front of the list. */
export const VISIBLE_BUSINESSES = logoFirst(BUSINESSES, getBusinessLogo);
