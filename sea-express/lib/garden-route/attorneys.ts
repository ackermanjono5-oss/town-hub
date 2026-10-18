import { TOWNS } from './towns';

/**
 * Garden Route attorneys, notaries and conveyancers.
 *
 * Only firms confirmed on their own live website are listed. Candidates came
 * from the southafricanlawyer.co.za directory (OpenStreetMap lists only two
 * law firms in the whole region); each was kept only if its website loaded
 * and carried the firm's name plus its town or phone number. Directory
 * listings without such a site — and parked or broken sites — were left out
 * rather than published unconfirmed. Phone numbers and practice areas come
 * from the directory listing of each verified firm.
 *
 * To add a firm, confirm it on its own website first, then re-run
 * scripts/fetch-attorney-logos.mjs to bundle its logo.
 */
export interface Attorney {
  id: string;
  name: string;
  town: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  lat?: number;
  lng?: number;
  verified?: boolean;
}

export const ATTORNEYS: Attorney[] = [
  {
    id: 'att-lad-1',
    name: 'Maarten Meyer Attorneys',
    town: 'ladismith',
    address: '21 Van Riebeeck Street, Ladismith, 7130',
    phone: '028 551 1115',
    email: 'law@maartenm.co.za',
    website: 'https://mmlaw.org.za',
    services: ['Conveyancing', 'Wills & Estates', 'Commercial', 'Personal Injury'],
    lat: -33.49376,
    lng: 21.26841,
    verified: true,
  },
  {
    id: 'att-hart-1',
    name: 'Ilse Schoeman Inc',
    town: 'hartenbos',
    phone: '044 695 2424',
    website: 'https://ilseschoeman.com',
    verified: true,
  },
  {
    id: 'att-mb-1',
    name: 'Cilliers & Associates',
    town: 'mossel-bay',
    address: 'Suite 11 Diaz Office Park, Beach Blvd West, Diaz, Mossel Bay',
    phone: '044 072 0020',
    email: 'elize@c-law.co.za',
    website: 'http://c-law.co.za',
    services: ['Wills & Estates', 'Family & Divorce', 'Litigation', 'Commercial'],
    lat: -34.16192,
    lng: 22.10828,
    verified: true,
  },
  {
    id: 'att-mb-2',
    name: 'Diedericks Attorneys',
    town: 'mossel-bay',
    address: '62 Da Gama Street, Da Nova, Mossel Bay',
    phone: '044 690 3325',
    email: 'mosseltown@mweb.co.za',
    website: 'https://www.diedericksinc.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial', 'Personal Injury'],
    lat: -34.18325,
    lng: 22.12422,
    verified: true,
  },
  {
    id: 'att-mb-3',
    name: 'Du Toit Lambrechts Incorporated',
    town: 'mossel-bay',
    address: '16 Marsh street, Mossel bay, 6500',
    phone: '044 690 3666',
    email: 'carel@dtllaw.co.za',
    website: 'https://dtllaw.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Commercial', 'Personal Injury'],
    verified: true,
  },
  {
    id: 'att-mb-4',
    name: 'L. Hugo Attorneys',
    town: 'mossel-bay',
    address: 'Suite 6, Stander Center, 268 Flora Road, Dana Bay, Mossel Bay',
    phone: '044 698 1115',
    email: 'louis@louishugo.co.za',
    website: 'http://www.louishugo.co.za',
    services: ['Wills & Estates', 'Family & Divorce', 'Litigation', 'Labour Law', 'Commercial'],
    lat: -34.19244,
    lng: 22.04122,
    verified: true,
  },
  {
    id: 'att-mb-5',
    name: 'Rauch Gertenbach Attorneys',
    town: 'mossel-bay',
    address: 'Old Advertiser Building, 10 Church Street, Mossel Bay',
    phone: '044 601 9900',
    email: 'office@rgprok.co.za',
    website: 'https://rgprok.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial', 'Insolvency', 'Personal Injury', 'Notarial'],
    lat: -34.18084,
    lng: 22.14309,
    verified: true,
  },
  {
    id: 'att-mb-6',
    name: 'Van Zyl, Ebrahim, Cook Attorneys Inc',
    town: 'mossel-bay',
    address: 'No. 7 Schoemanshof, 67 Marsh Street, Mossel Bay',
    email: 'nita@nvzinc.co.za',
    website: 'https://nvzinc.co.za',
    services: ['Commercial'],
    lat: -34.18233,
    lng: 22.14592,
    verified: true,
  },
  {
    id: 'att-geo-1',
    name: 'A Chimes Van Wyk Inc',
    town: 'george',
    address: 'Ground Floor, Church Corner, c/o Courtenay & Kerk Street, George',
    phone: '044 874 1621',
    email: 'adele@chimesvanwyk.co.za',
    website: 'https://www.chimesvanwyk.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Labour Law', 'Commercial', 'Insolvency'],
    lat: -33.95728,
    lng: 22.46319,
    verified: true,
  },
  {
    id: 'att-geo-2',
    name: 'DP Bezuidenhout Attorneys',
    town: 'george',
    address: '62 Cathedral Street, CBD, George, 6530',
    phone: '044 873 5067',
    email: 'dawie@bezlaw.co.za',
    website: 'https://www.bezlaw.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial'],
    lat: -33.95764,
    lng: 22.45946,
    verified: true,
  },
  {
    id: 'att-geo-3',
    name: 'DT du Preez Attorneys Inc',
    town: 'george',
    address: '31 Courtenay street, 1st Floor Dynarc Building, George, 6529',
    phone: '044 630 0803',
    email: 'law@dtdp.co.za',
    website: 'https://dtdupreez.co.za',
    services: ['Conveyancing'],
    verified: true,
  },
  {
    id: 'att-geo-4',
    name: 'Gerstner Attorneys Incorporated',
    town: 'george',
    address: '57B Victoria Street, George, 6529',
    phone: '044 874 0626',
    email: 'info@gerattorneys.co.za',
    website: 'https://gerattorneys.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Commercial'],
    lat: -33.96333,
    lng: 22.4565,
    verified: true,
  },
  {
    id: 'att-geo-5',
    name: 'Goussard en Assosiate Ing',
    town: 'george',
    phone: '044 874 7778',
    website: 'https://www.goussardattorneys.co.za',
    verified: true,
  },
  {
    id: 'att-geo-6',
    name: 'Haycock Attorneys',
    town: 'george',
    address: '7 Cathedral Square, Cathedral Street, George',
    phone: '044 873 0155',
    email: 'reception@khlegal.co.za',
    website: 'https://haycocklaw.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial', 'Insolvency', 'Personal Injury'],
    lat: -33.9598,
    lng: 22.46313,
    verified: true,
  },
  {
    id: 'att-geo-7',
    name: 'Isabelle Buhr Attorneys',
    town: 'george',
    phone: '044 884 0838',
    website: 'https://isabellebuhrattorneys.co.za',
    verified: true,
  },
  {
    id: 'att-geo-8',
    name: 'Jonker Attorneys Inc',
    town: 'george',
    phone: '044 873 4111',
    website: 'https://www.jonkerattorneys.co.za',
    verified: true,
  },
  {
    id: 'att-geo-9',
    name: 'Lombard Kotzé Inc',
    town: 'george',
    address: '134 Merriman Street, George, 6530',
    phone: '044 874 2610',
    email: 'chris@lombardkotze.co.za',
    website: 'http://lombardkotze.co.za',
    services: ['Wills & Estates', 'Family & Divorce', 'Litigation', 'Commercial'],
    lat: -33.96225,
    lng: 22.46679,
    verified: true,
  },
  {
    id: 'att-geo-10',
    name: 'Millers Attorneys',
    town: 'george',
    address: 'Beacon House, 123 Meade Street, George',
    phone: '044 874 1140',
    email: 'info@millers.co.za',
    website: 'https://www.millers.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Labour Law', 'Commercial', 'Insolvency', 'Personal Injury'],
    lat: -33.9579,
    lng: 22.46112,
    verified: true,
  },
  {
    id: 'att-geo-11',
    name: 'Mziyanda Mtiya Attorneys',
    town: 'george',
    address: '20 Joubert Plazza, 2 Meade Street, George, 6630',
    phone: '044 808 4557',
    email: 'mziyandam1920@gmail.com',
    website: 'https://mtiyaattorneys.co.za',
    services: ['Family & Divorce', 'Litigation', 'Criminal Law'],
    verified: true,
  },
  {
    id: 'att-geo-12',
    name: 'Nico Smit Attorneys',
    town: 'george',
    address: '77 Victoria Street, George, 6529',
    phone: '044 874 4727',
    email: 'admin@nicosmitinc.co.za',
    website: 'http://www.nicosmitinc.co.za',
    lat: -33.96163,
    lng: 22.45295,
    verified: true,
  },
  {
    id: 'att-geo-13',
    name: 'Raubenheimers Ingelyf',
    town: 'george',
    address: '60 Cathedral Street, George, 6529',
    phone: '044 873 2043',
    email: 'info@raubenheimers.co.za',
    website: 'https://raubenheimers.co.za',
    verified: true,
  },
  {
    id: 'att-geo-14',
    name: 'Rauch Gertenbach Attorneys',
    town: 'george',
    address: '120 York Street, George',
    phone: '044 601 9900',
    email: 'office@rgprok.co.za',
    website: 'https://rgprok.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial', 'Insolvency', 'Personal Injury', 'Notarial'],
    lat: -33.95693,
    lng: 22.45883,
    verified: true,
  },
  {
    id: 'att-geo-15',
    name: 'Riaan De Wit Attorneys',
    town: 'george',
    phone: '044 884 1522',
    website: 'https://riaandewitattorneys.co.za',
    verified: true,
  },
  {
    id: 'att-geo-16',
    name: 'Stenvert Attorneys & Transportbesorgers',
    town: 'george',
    phone: '044 871 1500',
    website: 'https://stenvertlaw.co.za',
    verified: true,
  },
  {
    id: 'att-kny-1',
    name: 'Balt Attorneys',
    town: 'knysna',
    address: '41 Fichat Street, Knysna',
    phone: '082 921 1593',
    email: 'willie@baltattorneys.co.za',
    website: 'http://www.baltattorneys.co.za',
    services: ['Conveyancing', 'Wills & Estates', 'Family & Divorce', 'Litigation', 'Criminal Law', 'Commercial', 'Notarial'],
    lat: -34.03453,
    lng: 23.04838,
    verified: true,
  },
  {
    id: 'att-kny-2',
    name: 'Logan-Martin Inc',
    town: 'knysna',
    phone: '044 382 1115',
    website: 'https://loganmartin.co.za',
    verified: true,
  },
  {
    id: 'att-kny-3',
    name: 'Mosdell Pama & Cox',
    town: 'knysna',
    website: 'https://www.mpc.law.za',
    verified: true,
  },
  {
    id: 'att-plett-1',
    name: 'Mosdell Pama & Cox',
    town: 'plett',
    address: '6 High Street, Plettenberg Bay',
    phone: '044 533 1101',
    email: 'mpcplett@mpc.law.za',
    website: 'https://www.mpc.law.za',
    services: ['Conveyancing', 'Litigation', 'Criminal Law', 'Labour Law', 'Commercial'],
    lat: -34.05697,
    lng: 23.36997,
    verified: true,
  },
];

export function getAttorneysByTown(town: string): Attorney[] {
  return ATTORNEYS.filter((a) => a.town === town);
}

export function countAttorneysByTown(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of ATTORNEYS) counts.set(a.town, (counts.get(a.town) ?? 0) + 1);
  return counts;
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * The closest towns that do have attorneys listed, for a town that has none —
 * most of the small villages rely on a firm in the nearest larger town.
 */
export function getNearestAttorneyTowns(
  town: string,
  limit = 2
): { slug: string; label: string; km: number; count: number }[] {
  const from = TOWNS.find((t) => t.slug === town);
  if (!from) return [];
  const counts = countAttorneysByTown();
  return TOWNS.filter((t) => t.slug !== town && (counts.get(t.slug) ?? 0) > 0)
    .map((t) => ({
      slug: t.slug,
      label: t.label,
      km: Math.round(distanceKm(from.lat, from.lng, t.lat, t.lng)),
      count: counts.get(t.slug) ?? 0,
    }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export function getAttorneyMapsUrl(attorney: Attorney, townLabel: string): string {
  if (attorney.lat != null && attorney.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${attorney.lat},${attorney.lng}`;
  }
  const query = [attorney.name, attorney.address ?? townLabel].join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
