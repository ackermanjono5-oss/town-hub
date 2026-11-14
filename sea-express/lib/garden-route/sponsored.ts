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
  | { kind: 'directions'; query: string; label?: string };

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

export interface TownBanner {
  id: string;
  name: string;
  towns: string[];
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
];

export const TOWN_BANNERS: TownBanner[] = [
  {
    id: 'mossinet',
    name: 'MossiNet',
    towns: ['plett', 'knysna'],
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
    image: '/ads/wittedrift-banner.webp',
    width: 810,
    height: 264,
    alt: 'Wittedrift Butchery, exceptional meat products. 36 Monument Street, Wittedrift. 044 535 9760.',
    actions: [
      { kind: 'facebook', url: 'https://www.facebook.com/share/1CFnZrAaqW/' },
      { kind: 'call', phone: '044 535 9760' },
      { kind: 'directions', query: '36 Monument Street, Wittedrift' },
    ],
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
      { kind: 'directions', query: '36 Monument Street, Wittedrift' },
    ],
  },
];

export function bannersForTown(town: string): TownBanner[] {
  return TOWN_BANNERS.filter((b) => b.towns.includes(town));
}

export function listingsForTown(town: string): SponsoredListing[] {
  return SPONSORED_LISTINGS.filter((l) => l.town === town);
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
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(action.query)}`;
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
