export interface EstateAgency {
  id: string;
  name: string;
  tagline: string;
  /** Logo asset relative to /public. */
  logo: string;
  /**
   * Brand background the logo needs. Several of these agencies only publish a
   * white-on-transparent wordmark, which is invisible on a white card — those
   * get their brand colour behind them instead. Omit for logos that already
   * read on white.
   */
  logoBg?: string;
  website: string;
}

/**
 * National estate agencies operating across the Garden Route. Listings
 * themselves live on each agency's own site and change daily, so the app
 * links out rather than trying to mirror stock it cannot keep current.
 *
 * Deliberately no per-town office addresses or phone numbers: those vary by
 * franchise and could not be verified, and a wrong number on a property
 * enquiry is worse than none. The Offices button runs a Maps search scoped
 * to the selected town instead.
 */
export const ESTATE_AGENCIES: EstateAgency[] = [
  {
    id: 'pam-golding',
    name: 'Pam Golding Properties',
    tagline: 'Residential, commercial and luxury property',
    logo: 'logos/pam-golding.svg',
    website: 'https://www.pamgolding.co.za',
  },
  {
    id: 'seeff',
    name: 'Seeff Property Group',
    tagline: 'Success With Every Move',
    logo: 'logos/seeff.svg',
    website: 'https://www.seeff.com',
  },
  {
    id: 'remax',
    name: 'RE/MAX',
    tagline: 'Nobody sells more real estate',
    logo: 'logos/remax.svg',
    website: 'https://www.remax.co.za',
  },
  {
    id: 'rawson',
    name: 'Rawson Property Group',
    tagline: 'Sales, rentals and property finance',
    logo: 'logos/rawson.png',
    website: 'https://www.rawson.co.za',
  },
  {
    id: 'chas-everitt',
    name: 'Chas Everitt International',
    tagline: 'International property group',
    logo: 'logos/chas-everitt.svg',
    logoBg: '#12263f',
    website: 'https://www.chaseveritt.co.za',
  },
  {
    id: 'lew-geffen-sothebys',
    name: "Lew Geffen Sotheby's International Realty",
    tagline: 'Luxury and lifestyle property',
    logo: 'logos/lew-geffen-sothebys.svg',
    logoBg: '#002349',
    website: 'https://www.sothebysrealty.co.za',
  },
  {
    id: 'engel-volkers',
    name: 'Engel & Völkers',
    tagline: 'Premium residential property',
    logo: 'logos/engel-volkers.png',
    website: 'https://www.engelvoelkers.com',
  },
  {
    id: 'fine-and-country',
    name: 'Fine & Country',
    tagline: 'Premium property specialists',
    logo: 'logos/fine-and-country.png',
    website: 'https://www.fineandcountry.co.za',
  },
  {
    id: 'century21',
    name: 'Century 21',
    tagline: 'Residential sales and rentals',
    logo: 'logos/century21.svg',
    website: 'https://www.century21.co.za',
  },
  {
    id: 'realnet',
    name: 'RealNet Properties',
    tagline: 'Homes, plots and commercial',
    logo: 'logos/realnet.svg',
    website: 'https://www.realnet.co.za',
  },
  {
    id: 'era',
    name: 'ERA Real Estate',
    tagline: 'Always there for you',
    logo: 'logos/era.svg',
    logoBg: '#1a1a1a',
    website: 'https://www.era.co.za',
  },
];

/** Maps search for an agency's offices, scoped to a town when one is picked. */
export function getAgencyOfficesUrl(agency: EstateAgency, townLabel?: string): string {
  const query = townLabel
    ? `${agency.name} ${townLabel}`
    : `${agency.name} Garden Route`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
