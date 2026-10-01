import { OSM_MEDICAL } from './medical-osm';
import { CHAIN_PHARMACIES } from './pharmacies';
import { PUBLIC_HEALTH } from './public-health';
import { logoFirst } from './display';

export type MedicalCategory = string;

// Filter list for the Medical Directory. Lives here rather than in the page
// so the data module stays the single source of truth for categories.
export const MEDICAL_CATEGORIES: MedicalCategory[] = [
  'Hospital',
  'Pharmacy',
  'Doctor',
  'Dentist',
  'Chemist',
  'Optometrist',
];

export interface OpeningHours {
  days: string;
  time: string;
}

export interface MedicalFacility {
  id: string;
  name: string;
  category: MedicalCategory;
  town: string;
  /** Full street address — also what the Navigate button searches on. */
  address?: string;
  phone?: string;
  /** Second landline, where a branch publishes one. */
  phoneAlt?: string;
  /** Local-format mobile, e.g. '078 474 1279'. Converted to wa.me on render. */
  whatsapp?: string;
  email?: string;
  /**
   * Emergency/casualty number, shown as a separate emphasised button. Only
   * set when it differs from `phone`, so the card never shows the same
   * number twice.
   */
  emergencyPhone?: string;
  /** Wording for the emergency button, e.g. 'After-hours emergency'. */
  emergencyLabel?: string;
  hours?: OpeningHours[];
  website?: string;
  /** Brand logo, relative to /public (e.g. 'logos/arrie-nel.png'). */
  logo?: string;
  /**
   * Exterior/building photo, relative to /public. Shown on the card so
   * people can recognise the building before they arrive. Optional —
   * cards render fine without it.
   */
  image?: string;
  lat?: number;
  lng?: number;
  /**
   * True for listings whose details were checked against the operator's own
   * website rather than imported. Surfaced as a badge on the card.
   */
  verified?: boolean;
  /**
   * Names this listing supersedes in the OpenStreetMap import, so the same
   * facility never appears twice. Matched case-insensitively within the same
   * town. Kept explicit rather than fuzzy-matched: silently hiding a real
   * pharmacy because its name looked similar would be worse than a duplicate.
   */
  supersedes?: string[];
}

/**
 * South African mobile numbers are given locally ('078 474 1279') but wa.me
 * needs full international digits with no symbols ('27784741279').
 */
export function getWhatsAppUrl(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `27${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

/**
 * Prefers the street address, which is what the branch listings supply and
 * what Maps resolves most reliably for a shop inside a centre. Falls back to
 * coordinates, then to a plain name search.
 */
export function getGoogleMapsUrl(facility: MedicalFacility): string {
  const query =
    facility.address ??
    (facility.lat !== undefined && facility.lng !== undefined
      ? `${facility.lat},${facility.lng}`
      : facility.name);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Shared by every Arrie Nel branch card.
const ARRIE_NEL_LOGO = 'logos/arrie-nel.png';

// Every hospital below runs a 24-hour emergency unit; general visiting and
// outpatient hours vary by department and are deliberately not listed
// rather than guessed.
const EMERGENCY_24H: OpeningHours[] = [{ days: 'Emergency unit', time: 'Open 24 hours' }];

const CURATED_MEDICAL: MedicalFacility[] = [
  // -------------------------------------------------------------------
  // Hospitals. Addresses and numbers taken from each operator's own site
  // (Western Cape Government, Life Healthcare, Mediclinic) rather than
  // from directory aggregators, which disagreed on several numbers.
  // -------------------------------------------------------------------
  {
    id: 'george-hospital',
    verified: true,
    supersedes: ['George Provincial Hospital'],
    name: 'George Hospital',
    category: 'Hospital',
    town: 'george',
    address: 'Cnr Davidson Road and Langenhoven Street, George, 6529',
    phone: '044 802 4528',
    hours: EMERGENCY_24H,
    website: 'https://www.westerncape.gov.za/health-wellness/facility/george-hospital',
  },
  {
    id: 'mediclinic-george',
    verified: true,
    supersedes: ['Mediclinic George'],
    name: 'Mediclinic George',
    category: 'Hospital',
    town: 'george',
    address: '2 Heron Street, George, 6529',
    phone: '086 177 7445',
    emergencyPhone: '044 803 2053',
    emergencyLabel: 'Emergency unit',
    hours: EMERGENCY_24H,
    website: 'https://www.mediclinic.co.za/en/george/home.html',
  },
  {
    id: 'mossel-bay-hospital',
    verified: true,
    supersedes: ['Mossel Bay Hospital'],
    name: 'Mossel Bay Hospital',
    category: 'Hospital',
    town: 'mossel-bay',
    address: '12th Avenue, Mossel Bay, 6500',
    phone: '044 604 6101',
    hours: EMERGENCY_24H,
    website: 'https://www.westerncape.gov.za/health-wellness/facility/mossel-bay-hospital',
  },
  {
    id: 'life-bay-view',
    verified: true,
    supersedes: ['Bayview Private Hospital'],
    name: 'Life Bay View Private Hospital',
    category: 'Hospital',
    town: 'mossel-bay',
    address: 'Cnr Alhof and Ryk Tulbach Streets, Mossel Bay, 6506',
    // Life lists the same number for switchboard and emergencies, so no
    // separate emergency button here.
    phone: '044 691 3718',
    hours: EMERGENCY_24H,
    website:
      'https://www.lifehealthcare.co.za/hospitals/western-cape/mossel-bay/life-bay-view-private-hospital/',
  },
  {
    id: 'knysna-hospital',
    verified: true,
    supersedes: ['Knysna Provincial Hospital'],
    name: 'Knysna Hospital',
    category: 'Hospital',
    town: 'knysna',
    address: 'Main Street, Knysna, 6571',
    phone: '044 302 8400',
    hours: EMERGENCY_24H,
    website: 'https://www.westerncape.gov.za/health-wellness/facility/knysna-hospital',
  },
  {
    id: 'life-knysna',
    verified: true,
    supersedes: ['Life Knysna Private Hospital'],
    name: 'Life Knysna Private Hospital',
    category: 'Hospital',
    town: 'knysna',
    address: 'Hunters Estate Drive, Hunters Home, Knysna, 6570',
    phone: '044 302 5201',
    phoneAlt: '044 302 5202',
    hours: EMERGENCY_24H,
    website:
      'https://www.lifehealthcare.co.za/hospitals/western-cape/knysna/life-knysna-private-hospital/',
  },
  {
    id: 'mediclinic-plettenberg-bay',
    verified: true,
    supersedes: ['Mediclinic Plettenberg Hospital'],
    name: 'Mediclinic Plettenberg Bay',
    category: 'Hospital',
    town: 'plett',
    address: 'Muller Street, Plettenberg Bay, 6600',
    phone: '044 501 5100',
    phoneAlt: '086 177 7440',
    hours: EMERGENCY_24H,
    website: 'https://www.mediclinic.co.za/en/plettenberg-bay/home.html',
  },

  // -------------------------------------------------------------------
  // Pharmacies
  // -------------------------------------------------------------------
  {
    id: 'arrie-nel-plett',
    verified: true,
    name: 'Arrie Nel Plettenberg Bay Pharmacy',
    category: 'Pharmacy',
    town: 'plett',
    address: 'Shop 3, Yellowood Centre, 15 Main Street, Plettenberg Bay, 6600',
    phone: '044 533 1370',
    whatsapp: '078 474 1279',
    email: 'plett@arrienel.co.za',
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 18:00' },
      { days: 'Saturday', time: '08:00 – 15:00' },
      { days: 'Sunday', time: 'Closed' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
  {
    id: 'arrie-nel-knysna-village',
    verified: true,
    supersedes: ['Knysna Village Pharmacy'],
    name: 'Arrie Nel Village Pharmacy – Knysna',
    category: 'Pharmacy',
    town: 'knysna',
    address: 'Spar Centre, 57 Main Road, Knysna, 6571',
    phone: '044 382 2245',
    whatsapp: '063 324 8920',
    email: 'village@arrienel.co.za',
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 18:00' },
      { days: 'Saturday', time: '08:00 – 14:00' },
      { days: 'Sunday', time: '09:00 – 13:00' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
  {
    id: 'arrie-nel-sedgefield',
    verified: true,
    name: 'Arrie Nel Sedgefield Pharmacy',
    category: 'Pharmacy',
    town: 'sedgefield',
    address: '49 Main Service Road, Sedgefield, 6573',
    phone: '044 343 1628',
    whatsapp: '082 804 0115',
    email: 'sedgefield@arrienel.co.za',
    emergencyPhone: '082 804 0115',
    emergencyLabel: 'After-hours emergency',
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 18:00' },
      { days: 'Saturday', time: '08:00 – 13:00' },
      { days: 'Sunday', time: '09:30 – 12:00' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
  {
    id: 'arrie-nel-george-protea',
    verified: true,
    supersedes: ['Protea Pharmacy'],
    name: 'Arrie Nel Protea Pharmacy',
    category: 'Pharmacy',
    town: 'george',
    address: '92 York Street, George Central, George, 6530',
    phone: '044 874 3124',
    phoneAlt: '044 874 3126',
    whatsapp: '060 584 4454',
    email: 'protea@arrienel.co.za',
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 19:00' },
      { days: 'Saturday', time: '08:00 – 14:00' },
      { days: 'Sunday', time: '09:00 – 13:00' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
  {
    id: 'arrie-nel-george-ress-van-zyl',
    verified: true,
    name: 'Arrie Nel Ress & van Zyl Apteek Pharmacy',
    category: 'Pharmacy',
    town: 'george',
    address: '83 Hibernia Street, George Central, George, 6529',
    phone: '044 873 2392',
    // WhatsApp and email are deliberately absent: the branch has not
    // published/verified them, so the card renders Call + Navigate only.
    // Do not fill these in until the branch confirms them.
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 17:30' },
      { days: 'Saturday', time: '08:00 – 14:00' },
      { days: 'Sunday', time: 'Closed' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
  {
    id: 'arrie-nel-mossel-bay',
    verified: true,
    name: 'Arrie Nel Mossel Bay Pharmacy',
    category: 'Pharmacy',
    town: 'mossel-bay',
    address: '10 Market Street, Mossel Bay, 6506',
    phone: '044 691 1835',
    whatsapp: '076 274 3686',
    email: 'mosselbaai@arrienel.co.za',
    hours: [
      { days: 'Monday – Friday', time: '08:00 – 18:00' },
      { days: 'Saturday', time: '08:00 – 14:00' },
      { days: 'Sunday', time: '09:00 – 12:00' },
    ],
    logo: ARRIE_NEL_LOGO,
  },
];

/**
 * Official brand marks, matched by listing name. Chains appear in the OSM
 * import under many local names ("Dis-Chem Pharmacy", "Dischem"), so matching
 * on a pattern is what lets one asset serve every branch — and keeps working
 * after a re-import brings in new branches.
 *
 * Patterns are anchored or word-bounded to avoid false positives: `^clicks\b`
 * so a shop merely mentioning "clicks" never picks up the Clicks logo.
 * Assets were downloaded from each brand's own record and cropped/resized;
 * several only publish a white-on-transparent wordmark, so those use the
 * brand's square icon instead, which reads correctly on the white cards.
 */
const BRAND_LOGOS: { pattern: RegExp; logo: string }[] = [
  { pattern: /\barrie\s*nel\b/i, logo: ARRIE_NEL_LOGO },
  { pattern: /\bmediclinic\b/i, logo: 'logos/mediclinic.png' },
  { pattern: /^life\b/i, logo: 'logos/life-healthcare.png' },
  { pattern: /^clicks\b/i, logo: 'logos/clicks.png' },
  { pattern: /\bdis[-\s]?chem\b/i, logo: 'logos/dis-chem.png' },
  { pattern: /\bspec[-\s]?savers\b/i, logo: 'logos/specsavers.png' },
  { pattern: /\bintercare\b/i, logo: 'logos/intercare.png' },
  { pattern: /\bpathcare\b/i, logo: 'logos/pathcare.png' },
  { pattern: /\balpha\s*pharm\b/i, logo: 'logos/alpha-pharm.png' },
  // Provincial hospitals and day centres run by the Western Cape Government.
  {
    pattern: /\b(george|mossel bay|knysna) hospital\b|community day centre\b|blood service\b/i,
    logo: 'logos/western-cape-gov.png',
  },
];

function withBrandLogo(facility: MedicalFacility): MedicalFacility {
  if (facility.logo) return facility;
  const match = BRAND_LOGOS.find((b) => b.pattern.test(facility.name));
  return match ? { ...facility, logo: match.logo } : facility;
}

// Curated entries win over the OSM import; anything they supersede is dropped.
const SUPERSEDED = new Set(
  CURATED_MEDICAL.flatMap((f) =>
    (f.supersedes ?? []).map((name) => `${f.town}|${name.toLowerCase()}`)
  )
);

// A chain branch and its OSM node are the same shop, and OSM's version is
// usually the thinner record (often unnamed, rarely with an address). Keyed
// on town plus the distinctive part of the name so "Clicks Eden Meander"
// also knocks out a plain "Clicks" node in the same town.
const CHAIN_KEYS = new Set(
  CHAIN_PHARMACIES.flatMap((f) => {
    const name = f.name.toLowerCase();
    const brand = name.split(' ')[0];
    return [`${f.town}|${name}`, `${f.town}|${brand}`];
  })
);

function isDuplicateOfChain(f: MedicalFacility): boolean {
  const name = f.name.toLowerCase();
  return CHAIN_KEYS.has(`${f.town}|${name}`) || CHAIN_KEYS.has(`${f.town}|${name.split(' ')[0]}`);
}

// The provincial directory and OSM often hold the same clinic, with OSM's
// copy the thinner record. Match on town plus name so the government entry
// — which carries the switchboard, email and operating hours — wins.
const PUBLIC_KEYS = new Set(
  PUBLIC_HEALTH.map((f) => `${f.town}|${f.name.toLowerCase()}`)
);

function isDuplicateOfPublic(f: MedicalFacility): boolean {
  return PUBLIC_KEYS.has(`${f.town}|${f.name.toLowerCase()}`);
}

export const MEDICAL_FACILITIES: MedicalFacility[] = [
  ...CURATED_MEDICAL,
  ...CHAIN_PHARMACIES.filter(
    (f) => !SUPERSEDED.has(`${f.town}|${f.name.toLowerCase()}`)
  ),
  ...PUBLIC_HEALTH.filter(
    (f) => !SUPERSEDED.has(`${f.town}|${f.name.toLowerCase()}`)
  ),
  ...OSM_MEDICAL.filter(
    (f) =>
      !SUPERSEDED.has(`${f.town}|${f.name.toLowerCase()}`) &&
      !isDuplicateOfChain(f) &&
      !isDuplicateOfPublic(f)
  ),
].map(withBrandLogo);

// Every category actually present, in MEDICAL_CATEGORIES order first so the
// common ones lead, then any extra the import introduced.
export const ACTIVE_CATEGORIES: MedicalCategory[] = Array.from(
  new Set(MEDICAL_FACILITIES.map((f) => f.category))
).sort((a, b) => {
  const ai = MEDICAL_CATEGORIES.indexOf(a);
  const bi = MEDICAL_CATEGORIES.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
});

export function countByCategory(town: string): Map<MedicalCategory, number> {
  const counts = new Map<MedicalCategory, number>();
  for (const f of MEDICAL_FACILITIES) {
    if (f.town !== town) continue;
    counts.set(f.category, (counts.get(f.category) ?? 0) + 1);
  }
  return counts;
}

// Hospitals first within a town — in a medical directory they are what
// someone is most likely to be looking for in a hurry.
const CATEGORY_ORDER = new Map(MEDICAL_CATEGORIES.map((c, i) => [c, i]));

export function getMedicalByTown(town: string) {
  // Category leads — a hospital must stay above a pharmacy whether or not it
  // has a logo — then branded listings lead within each category.
  return MEDICAL_FACILITIES.filter((m) => m.town === town).sort((a, b) => {
    const byCategory =
      (CATEGORY_ORDER.get(a.category) ?? Number.MAX_SAFE_INTEGER) -
      (CATEGORY_ORDER.get(b.category) ?? Number.MAX_SAFE_INTEGER);
    if (byCategory !== 0) return byCategory;
    return Number(Boolean(b.logo)) - Number(Boolean(a.logo));
  });
}
