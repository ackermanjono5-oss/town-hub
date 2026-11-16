/**
 * Paid placements, hand-maintained. Kept apart from businesses.ts, which is
 * regenerated from OpenStreetMap and would drop anything added there.
 *
 *   FRONT_PAGE_ADS      — posters that take turns on the home page.
 *   TOWN_BANNERS        — wide banners shown in the Business Directory only
 *                         when one of their towns is selected.
 *   SPONSORED_LISTINGS  — listings pinned above the results for their town.
 *
 * Images live in public/ads/. Each advertiser chose how people may reach
 * them, so each placement lists exactly the buttons they asked for.
 */

export type AdAction =
  | { kind: 'whatsapp'; phone: string; label?: string }
  | { kind: 'call'; phone: string; label?: string }
  | { kind: 'facebook'; url: string; label?: string }
  | { kind: 'email'; address: string; label?: string }
  /** A map search for `query`, or `url` when the advertiser shared their own map link. */
  | { kind: 'directions'; query: string; url?: string; label?: string };

export interface FrontPageAd {
  id: string;
  name: string;
  image: string;
  /** Pixel size of the image, so the space is reserved before it loads. */
  width: number;
  height: number;
  alt: string;
  actions: AdAction[];
}

export type Directory = 'businesses' | 'medical';

export interface TownBanner {
  id: string;
  name: string;
  towns: string[];
  /** The directories it appears in, for its towns. */
  directories: Directory[];
  image: string;
  width: number;
  height: number;
  alt: string;
  actions: AdAction[];
}

export interface SponsoredListing {
  id: string;
  name: string;
  category: string;
  town: string;
  logo: string;
  description: string;
  actions: AdAction[];
}

const MOSSI_PHONE = '073 169 0523';

// Dr G Coci has no website; these are the contacts on his poster, and the
// map link he sent for his rooms.
const COCI_ACTIONS: AdAction[] = [
  { kind: 'call', phone: '044 533 4471' },
  { kind: 'email', address: 'drcociad@gmail.com', label: 'Email' },
  {
    kind: 'directions',
    query: '2a Medway Centre, Muller Street, Plettenberg Bay',
    url: 'https://share.google/thubrDTS5J2XTfzo7',
  },
];

export const FRONT_PAGE_ADS: FrontPageAd[] = [
  {
    id: 'mossiscreen',
    name: 'MossiScreen',
    image: '/ads/mossiscreen-poster.webp',
    width: 588,
    height: 627,
    alt: 'MossiScreen: custom-made, lightweight mosquito frames for doors and windows, and clear burglar proofing. Call for a quote on 073 169 0523.',
    actions: [
      { kind: 'whatsapp', phone: MOSSI_PHONE },
      { kind: 'call', phone: MOSSI_PHONE },
    ],
  },
  {
    id: 'sea-express',
    name: 'Sea Express',
    image: '/ads/seaexpress-poster.webp',
    width: 579,
    height: 756,
    alt: 'Sea Express, the free community newspaper for Plettenberg Bay, Knysna and George: local news, community stories, events and notices, business and services, and what’s on in the Garden Route.',
    actions: [
      { kind: 'facebook', url: 'https://www.facebook.com/share/1FWMc4tcjf/' },
      { kind: 'email', address: 'plettnews@seaexpress.co.za', label: 'Send a story' },
    ],
  },
  {
    id: 'dr-coci',
    name: 'Dr G Coci, Specialist Physician',
    image: '/ads/coci-poster.webp',
    width: 810,
    height: 810,
    alt: 'Dr G Coci, Specialist Physician: comprehensive care of heart, lungs, liver, gut, kidney, thyroid and blood diseases; annual physicals, preventive care and medical imaging; diabetes, hypertension and lipid disorders. 2a Medway Centre, Muller Street, Plettenberg Bay. +27 44 533 4471. drcociad@gmail.com.',
    actions: COCI_ACTIONS,
  },
];

export const TOWN_BANNERS: TownBanner[] = [
  {
    id: 'mossinet',
    name: 'MossiNet',
    towns: ['plett', 'knysna'],
    directories: ['businesses'],
    image: '/ads/mossinet-banner.webp',
    width: 810,
    height: 261,
    alt: 'MossiNet: mosquito netting and clear burglar proofing. 073 169 0523.',
    // The advertiser asked for WhatsApp only on this banner.
    actions: [{ kind: 'whatsapp', phone: MOSSI_PHONE }],
  },
  {
    id: 'wittedrift-butchery',
    name: 'Wittedrift Organic Butchery',
    towns: ['wittedrift'],
    directories: ['businesses'],
    image: '/ads/wittedrift-banner.webp',
    width: 810,
    height: 261,
    alt: 'Wittedrift Butchery, exceptional meat products. 36 Monument Street, Wittedrift. 044 535 9760 or 082 536 4407.',
    actions: [
      { kind: 'facebook', url: 'https://www.facebook.com/share/1CFnZrAaqW/' },
      { kind: 'call', phone: '044 535 9760' },
      { kind: 'call', phone: '082 536 4407' },
      { kind: 'directions', query: '36 Monument Street, Wittedrift' },
    ],
  },
  {
    id: 'dr-coci',
    name: 'Dr G Coci, Specialist Physician',
    towns: ['plett'],
    // A doctor belongs in the Medical directory too.
    directories: ['businesses', 'medical'],
    image: '/ads/coci-banner.webp',
    width: 810,
    height: 270,
    alt: 'Dr G Coci, Specialist Physician. 2a Medway Centre, Muller Street, Plettenberg Bay. +27 44 533 4471. drcociad@gmail.com.',
    actions: COCI_ACTIONS,
  },
];

export const SPONSORED_LISTINGS: SponsoredListing[] = [
  {
    id: 'sea-express',
    name: 'Sea Express Community Newspaper',
    category: 'Newspaper',
    town: 'plett',
    logo: '/ads/seaexpress-logo.webp',
    description:
      'Free community newspaper for Plettenberg Bay, Knysna and George: local news, community stories, events, notices and what’s on.',
    // The newspaper asked for these contacts only, and no phone numbers.
    actions: [
      { kind: 'facebook', url: 'https://www.facebook.com/share/1FWMc4tcjf/' },
      { kind: 'email', address: 'info@seaexpress.co.za', label: 'Enquiries' },
      { kind: 'email', address: 'plettnews@seaexpress.co.za', label: 'News & stories' },
    ],
  },
  {
    id: 'wittedrift-butchery',
    name: 'Wittedrift Organic Butchery',
    category: 'Butchery',
    town: 'wittedrift',
    logo: '/ads/wittedrift-logo.webp',
    description:
      'Fresh meat, chicken, dry wors, biltong, real butter and fresh vegetables, with water refills. Also at the Wednesday and Saturday markets.',
    actions: [
      { kind: 'facebook', url: 'https://www.facebook.com/share/1CFnZrAaqW/' },
      { kind: 'call', phone: '044 535 9760' },
      { kind: 'call', phone: '082 536 4407' },
      { kind: 'directions', query: '36 Monument Street, Wittedrift' },
    ],
  },
];

export function bannersForTown(town: string, directory: Directory = 'businesses'): TownBanner[] {
  return TOWN_BANNERS.filter((b) => b.towns.includes(town) && b.directories.includes(directory));
}

/** Featured listings are for the Business Directory only. */
export function listingsForTown(town: string, directory: Directory = 'businesses'): SponsoredListing[] {
  return directory === 'businesses' ? SPONSORED_LISTINGS.filter((l) => l.town === town) : [];
}

/** A South African number as digits with the country code, e.g. "27731690523". */
export function internationalDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('27')) return digits;
  if (digits.startsWith('0')) return `27${digits.slice(1)}`;
  return digits;
}

export function actionHref(action: AdAction): string {
  switch (action.kind) {
    case 'whatsapp':
      return `https://wa.me/${internationalDigits(action.phone)}`;
    case 'call':
      return `tel:+${internationalDigits(action.phone)}`;
    case 'facebook':
      return action.url;
    case 'email':
      return `mailto:${action.address}`;
    case 'directions':
      return action.url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(action.query)}`;
  }
}

export function actionLabel(action: AdAction): string {
  if (action.label) return action.label;
  switch (action.kind) {
    case 'whatsapp':
      return 'WhatsApp';
    case 'call':
      return `Call ${action.phone}`;
    case 'facebook':
      return 'Facebook';
    case 'email':
      return action.address;
    case 'directions':
      return 'Directions';
  }
}
