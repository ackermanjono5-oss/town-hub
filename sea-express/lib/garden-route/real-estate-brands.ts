export interface Sponsor {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  website: string;
  logoBg?: string;
}

export const SPONSORS: Sponsor[] = [
  {
    id: 'buco',
    name: 'BUCO Hardware',
    tagline: 'Your local hardware store',
    logo: '/logos/buco.svg',
    website: 'https://www.buco.co.za',
    logoBg: '#0057A8',
  },
  {
    id: 'buildit',
    name: 'Build It',
    tagline: 'Building supplies & materials',
    logo: '/logos/buildit.svg',
    website: 'https://www.buildit.co.za',
    logoBg: '#CC1111',
  },
  {
    id: 'seeff',
    name: 'Seeff Properties',
    tagline: 'Success With Every Move',
    logo: '/logos/seeff.svg',
    website: 'https://www.seeff.com',
    logoBg: '#17214b',
  },
  {
    id: 'plettenberg',
    name: 'The Plettenberg',
    tagline: 'Boutique Hotel · Plettenberg Bay',
    logo: '/logos/plettenberg.svg',
    website: 'https://www.collectionmcgrath.com/hotels/the-plettenberg/',
    logoBg: '#1A1A1A',
  },
  {
    id: 'mobys',
    name: "Moby's Seafood Grill & Deck",
    tagline: 'Central Beach · Plettenberg Bay',
    logo: '/logos/mobys.svg',
    website: 'https://mobydicks.co.za',
    logoBg: '#101820',
  },
  {
    id: 'hoopers-vw',
    name: "Hooper's VW",
    tagline: 'Volkswagen Dealership',
    logo: '/logos/hoopers-vw.svg',
    website: 'https://www.hoopersvw.co.za',
    logoBg: '#001E50',
  },
  {
    id: 'nissan-preowned',
    name: 'DTM Nissan George',
    tagline: 'Quality Pre-Owned Nissan Vehicles',
    logo: '/logos/nissan-preowned.svg',
    website: 'https://dtmgeorge.co.za',
    logoBg: '#C3002F',
  },
];

// Keep old export name for any other files that may import it
export const REAL_ESTATE_BRANDS = SPONSORS;
