import { TOWNS } from './towns';
import { ESTATE_AGENCIES, type EstateAgency } from './estate-agencies';

/**
 * Estate agency offices on the Garden Route, town by town.
 *
 * Two sources, gathered in November 2026:
 *  - `verified: true` — the office is listed on the agency's own website,
 *    and its address, phone and email were copied from there (RE/MAX's
 *    office finder, RealNet's and Fine & Country's branch pages, Seeff's
 *    branch list).
 *  - the rest are estate agent offices mapped on OpenStreetMap, with the
 *    phone number only where the map has one. Data © OpenStreetMap
 *    contributors (ODbL). Offices in Dana Bay are listed under Mossel Bay,
 *    which it is part of.
 *
 * `agency` links an office to its national brand in estate-agencies.ts for
 * the logo and website; independent agencies leave it out.
 */
export interface EstateOffice {
  id: string;
  name: string;
  agency?: string;
  town: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  lat?: number;
  lng?: number;
  verified?: boolean;
}

export const ESTATE_OFFICES: EstateOffice[] = [
  // ---- Checked on the agencies' own websites --------------------------
  {
    id: 'remax-coastal-knysna',
    name: 'RE/MAX Coastal (Knysna)',
    agency: 'remax',
    town: 'knysna',
    address: 'Unit 1, Waterside Shopping Centre, Union Street, Knysna',
    phone: '044 382 5722',
    website: 'https://www.remax.co.za/offices/remax-coastal-knysna/800643',
    lat: -34.040207,
    lng: 23.054125,
    verified: true,
  },
  {
    id: 'remax-coastal-sedgefield',
    name: 'RE/MAX Coastal (Sedgefield)',
    agency: 'remax',
    town: 'sedgefield',
    address: 'Hooper Building, Main Road, Sedgefield',
    phone: '044 343 1905',
    website: 'https://www.remax.co.za/offices/remax-coastal-sedgefield/800645',
    lat: -34.022648,
    lng: 22.807571,
    verified: true,
  },
  {
    id: 'remax-coastal-wilderness',
    name: 'RE/MAX Coastal (Wilderness)',
    agency: 'remax',
    town: 'wilderness',
    address: 'Shop 3, 1 George Street, Wilderness',
    phone: '044 877 0042',
    website: 'https://www.remax.co.za/offices/remax-coastal-wilderness/800644',
    lat: -33.994156,
    lng: 22.57597,
    verified: true,
  },
  {
    id: 'remax-coastal-mossel-bay',
    name: 'RE/MAX Coastal (Mossel Bay)',
    agency: 'remax',
    town: 'mossel-bay',
    address: '13 Diaz Office Park, 1 Beach Boulevard West, Diaz Beach, Mossel Bay',
    phone: '044 008 5092',
    website: 'https://www.remax.co.za/offices/remax-coastal-mossel-bay/597628',
    lat: -34.162167,
    lng: 22.108335,
    verified: true,
  },
  {
    id: 'remax-gem-great-brak',
    name: 'RE/MAX Gem (Groot Brakrivier)',
    agency: 'remax',
    town: 'great-brak-river',
    address: 'Shop 6 Waterfront, 1 Stasie Street, Groot Brakrivier',
    phone: '044 695 2534',
    website: 'https://www.remax.co.za/offices/remax-gem-groot-brakrivier/947836',
    lat: -34.038967,
    lng: 22.221485,
    verified: true,
  },
  {
    id: 'remax-gem-hartenbos',
    name: 'RE/MAX Gem (Hartenbos)',
    agency: 'remax',
    town: 'hartenbos',
    phone: '044 695 2534',
    website: 'https://www.remax.co.za/offices/remax-gem-hartenbos/913628',
    lat: -34.12392,
    lng: 22.10944,
    verified: true,
  },
  {
    id: 'remax-gem-stilbaai',
    name: 'RE/MAX Gem (Stilbaai)',
    agency: 'remax',
    town: 'stilbaai',
    address: '7 Riebeeck Street, Stilbaai West',
    phone: '087 265 3266',
    website: 'https://www.remax.co.za/offices/remax-gem-stilbaai/358672',
    lat: -34.369987,
    lng: 21.404835,
    verified: true,
  },
  {
    id: 'realnet-george',
    name: 'RealNet George and Sedgefield',
    agency: 'realnet',
    town: 'george',
    address: '16 Wellington Street, George',
    phone: '044 868 0300',
    email: 'georgesedgefield@realnet.co.za',
    website: 'https://realnet.co.za/offices/realnet-george/',
    lat: -33.955849,
    lng: 22.46603,
    verified: true,
  },
  {
    id: 'fine-and-country-george',
    name: 'Fine & Country George',
    agency: 'fine-and-country',
    town: 'george',
    address: '3 Courtenay Street, George',
    phone: '021 205 7135',
    email: 'george@fineandcountry.com',
    website: 'https://www.fineandcountry.co.za/george-outeniqua-estate-agents',
    verified: true,
  },
  {
    id: 'seeff-plettenberg-bay',
    name: 'Seeff Plettenberg Bay',
    agency: 'seeff',
    town: 'plett',
    website: 'https://plettenbergbay.seeff.com/',
    verified: true,
  },

  // ---- From OpenStreetMap -----------------------------------------------
  { id: 'osm-2233742482', name: 'Engel & Völkers George', agency: 'engel-volkers', town: 'george', lat: -33.95728, lng: 22.46364 },
  { id: 'osm-3250950046', name: 'Chas Everitt George', agency: 'chas-everitt', town: 'george', lat: -33.9509, lng: 22.43309 },
  { id: 'osm-2233742484', name: 'Just Letting', town: 'george', lat: -33.95738, lng: 22.4638 },
  { id: 'osm-2233742496', name: 'Susan Deacon Properties (George)', town: 'george', lat: -33.95586, lng: 22.46129 },
  { id: 'osm-2244952365', name: 'Vault Properties', town: 'george', lat: -33.95789, lng: 22.4649 },
  {
    id: 'osm-2464439072',
    name: 'Fine & Country Wilderness',
    agency: 'fine-and-country',
    town: 'wilderness',
    phone: '044 877 0146',
    lat: -33.99373,
    lng: 22.57518,
  },
  { id: 'osm-2464439075', name: "Lew Geffen Sotheby's (Wilderness)", agency: 'lew-geffen-sothebys', town: 'wilderness', lat: -33.9938, lng: 22.57493 },
  { id: 'osm-2464439077', name: 'Susan Deacon Properties (Wilderness)', town: 'wilderness', phone: '044 874 6882', lat: -33.99373, lng: 22.57512 },
  {
    id: 'osm-2547315660',
    name: 'ERA Mossel Bay',
    agency: 'era',
    town: 'mossel-bay',
    address: '27 Marsh Street, Mossel Bay',
    phone: '044 690 5077',
    lat: -34.18277,
    lng: 22.15068,
  },
  { id: 'osm-2500441500', name: 'Rawson Mossel Bay', agency: 'rawson', town: 'mossel-bay', lat: -34.18041, lng: 22.14328 },
  { id: 'osm-2547315588', name: 'Aida Mossel Bay', town: 'mossel-bay', address: 'Marsh Street, Mossel Bay', lat: -34.18273, lng: 22.14896 },
  { id: 'osm-3663096243', name: 'One Way Estates', town: 'mossel-bay', lat: -34.18165, lng: 22.13304 },
  { id: 'osm-2456767527', name: 'Pam Golding Properties (Dana Bay)', agency: 'pam-golding', town: 'mossel-bay', lat: -34.19165, lng: 22.05103 },
  { id: 'osm-3375598037', name: 'RealNet (Dana Bay)', agency: 'realnet', town: 'mossel-bay', address: 'Flora Road, Dana Bay', lat: -34.19201, lng: 22.0496 },
  { id: 'osm-2449937505', name: 'MLA Eiendomme (Dana Bay)', town: 'mossel-bay', lat: -34.19198, lng: 22.04926 },
  { id: 'osm-2455152305', name: 'Japie Krige (Dana Bay)', town: 'mossel-bay', lat: -34.19207, lng: 22.05018 },
  { id: 'osm-2455152306', name: 'Boetie le Roux (Dana Bay)', town: 'mossel-bay', lat: -34.1917, lng: 22.05077 },
  { id: 'osm-11446333911', name: 'Rawson Knysna', agency: 'rawson', town: 'knysna', phone: '044 382 4961', lat: -34.03956, lng: 23.04514 },
  { id: 'osm-11452257867', name: 'Seeff Knysna', agency: 'seeff', town: 'knysna', lat: -34.04743, lng: 23.04749 },
  { id: 'osm-11452304671', name: 'Engel & Völkers Knysna', agency: 'engel-volkers', town: 'knysna', lat: -34.04677, lng: 23.04788 },
  { id: 'osm-13428526213', name: 'Century 21 Knysna', agency: 'century21', town: 'knysna', lat: -34.04848, lng: 23.04724 },
  { id: 'osm-12486077312', name: "Lew Geffen Sotheby's (Knysna)", agency: 'lew-geffen-sothebys', town: 'knysna', lat: -34.06712, lng: 23.06179 },
  {
    id: 'osm-12620786319',
    name: "Lew Geffen Sotheby's (Plettenberg Bay)",
    agency: 'lew-geffen-sothebys',
    town: 'plett',
    address: '25 Main Street, Plettenberg Bay',
    lat: -34.05315,
    lng: 23.3726,
  },
  { id: 'osm-12620786317', name: 'Robberg Estate', town: 'plett', lat: -34.05339, lng: 23.37259 },
  {
    id: 'osm-12657063191',
    name: '100k Property Fee',
    town: 'natures-valley',
    phone: '082 900 4201',
    website: 'https://100kpropertyfee.co.za/',
    lat: -33.97613,
    lng: 23.56175,
  },
  { id: 'osm-13739607361', name: 'Aida Riversdale', town: 'riversdale', lat: -34.09197, lng: 21.2579 },
  { id: 'osm-1351553378', name: 'Servamus Properties', town: 'riversdale', lat: -34.09042, lng: 21.25799 },
];

const AGENCIES = new Map(ESTATE_AGENCIES.map((a) => [a.id, a]));

/** The national brand an office belongs to, if any. */
export function getOfficeAgency(office: EstateOffice): EstateAgency | undefined {
  return office.agency ? AGENCIES.get(office.agency) : undefined;
}

/** The agency's own page for this office, else its brand's site. */
export function getOfficeWebsite(office: EstateOffice): string | undefined {
  return office.website ?? getOfficeAgency(office)?.website;
}

/** Brand name for the Agency filter; offices without a brand are "Independent". */
export function getOfficeBrand(office: EstateOffice): string {
  return getOfficeAgency(office)?.name ?? 'Independent';
}

export function getOfficesByTown(town: string): EstateOffice[] {
  return ESTATE_OFFICES.filter((o) => o.town === town);
}

export function countOfficesByTown(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const o of ESTATE_OFFICES) counts.set(o.town, (counts.get(o.town) ?? 0) + 1);
  return counts;
}

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** The closest towns that have agencies listed, for a town that has none. */
export function getNearestOfficeTowns(
  town: string,
  limit = 2
): { slug: string; label: string; km: number; count: number }[] {
  const from = TOWNS.find((t) => t.slug === town);
  if (!from) return [];
  const counts = countOfficesByTown();
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

export function getOfficeMapsUrl(office: EstateOffice, townLabel: string): string {
  if (office.lat != null && office.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${office.lat},${office.lng}`;
  }
  const query = [office.name, office.address ?? townLabel].join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
