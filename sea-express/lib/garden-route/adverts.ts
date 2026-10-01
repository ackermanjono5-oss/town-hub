export interface Advert {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  // Where tapping the advert goes. Businesses with an official site link
  // straight to it; those without get a Google Maps lookup instead, so
  // every advert is still actionable. Exactly one of these is set.
  website?: string;
  mapsQuery?: string;
  logoBg?: string;
}

// Same Google Maps search-URL shape lib/garden-route/medical.ts already
// uses, so map hand-offs behave identically across the app.
export function advertHref(advert: Advert): string {
  if (advert.website) return advert.website;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    advert.mapsQuery ?? advert.name
  )}`;
}

export const ADVERTS: Advert[] = [
  {
    id: 'buco',
    name: 'BUCO Hardware',
    tagline: 'Your local hardware store',
    logo: 'logos/buco.svg',
    website: 'https://www.buco.co.za',
    logoBg: '#0057A8',
  },
  {
    id: 'buildit',
    name: 'Build It',
    tagline: 'Building supplies & materials',
    logo: 'logos/buildit.svg',
    website: 'https://www.buildit.co.za',
    logoBg: '#CC1111',
  },
  {
    id: 'seeff',
    name: 'Seeff Properties',
    tagline: 'Success With Every Move',
    logo: 'logos/seeff.svg',
    website: 'https://www.seeff.com',
    logoBg: '#17214b',
  },
  {
    id: 'plettenberg',
    name: 'The Plettenberg',
    tagline: 'Boutique Hotel · Plettenberg Bay',
    logo: 'logos/plettenberg.svg',
    website: 'https://www.collectionmcgrath.com/hotels/the-plettenberg/',
    logoBg: '#1A1A1A',
  },
  {
    id: 'mobys',
    name: "Moby's Seafood Grill & Deck",
    tagline: 'Central Beach · Plettenberg Bay',
    logo: 'logos/mobys.png',
    website: 'https://mobydicks.co.za',
    logoBg: '#ffffff',
  },
  {
    id: 'hoopers-vw',
    name: "Hooper's VW",
    tagline: 'Volkswagen Dealership',
    logo: 'logos/hoopers-vw.png',
    website: 'https://www.hoopersvw.co.za',
    logoBg: '#ffffff',
  },
  {
    id: 'smhart-security',
    name: 'Smhart Security',
    tagline: '24hr Armed Response · Plettenberg Bay',
    logo: 'logos/smhart-security.webp',
    website: 'https://smhart-security.co.za',
    logoBg: '#0b1b3a',
  },
  {
    id: 'unique-barber-shop',
    name: 'Unique Barber Shop',
    tagline: 'Great style for men',
    logo: 'logos/unique-barber-shop.webp',
    // No official website found, so this one hands off to Google Maps.
    mapsQuery: 'Unique Barber Shop 010 011 2423',
    logoBg: '#000000',
  },
];
