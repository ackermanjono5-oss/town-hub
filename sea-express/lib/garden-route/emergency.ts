export type EmergencyType =
  | 'general'
  | 'nsri'
  | 'police'
  | 'ambulance'
  | 'fire'
  | 'security'
  | 'neighbourhood';

export interface EmergencyContact {
  id: string;
  type: EmergencyType;
  name: string;
  phone: string;
  town?: string;
}

// National numbers — apply across South Africa regardless of town.
// 112 is listed first: it works from any mobile phone, and is the number the
// Community Guidelines (app/guidelines) tell people to dial.
export const NATIONAL_CONTACTS: EmergencyContact[] = [
  { id: 'nat-0', type: 'general', name: 'Emergency from a mobile', phone: '112' },
  { id: 'nat-1', type: 'police', name: 'SAPS Emergency', phone: '10111' },
  { id: 'nat-2', type: 'ambulance', name: 'Ambulance / EMS', phone: '10177' },
  { id: 'nat-3', type: 'fire', name: 'Fire Department', phone: '10179' },
  { id: 'nat-4', type: 'security', name: 'Netcare911', phone: '082 911' },
  {
    id: 'nat-5',
    type: 'security',
    name: 'Fidelity ADT (Armed Response)',
    phone: '086 12 12 301',
  },
  {
    id: 'nat-6',
    type: 'neighbourhood',
    name: 'SAPS Crime Stop / CPF',
    phone: '086 00 10111',
  },
];

// Hand-verified town contacts (do not regenerate — these are confirmed real
// numbers, unlike OSM_TOWN_CONTACTS below). Cross-checked against SAPS,
// municipal, and NSRI sources (July 2026).
export const CONFIRMED_TOWN_CONTACTS: EmergencyContact[] = [
  // Mossel Bay
  {
    id: 'mossel-bay-nsri',
    type: 'nsri',
    name: 'NSRI Station 15 (Mossel Bay)',
    phone: '082 990 5954',
    town: 'mossel-bay',
  },
  {
    id: 'mossel-bay-saps',
    type: 'police',
    name: 'Mossel Bay SAPS',
    phone: '044 606 2800',
    town: 'mossel-bay',
  },
  {
    id: 'mossel-bay-fire',
    type: 'fire',
    name: 'Mossel Bay Fire Department',
    phone: '044 691 3722',
    town: 'mossel-bay',
  },

  // George
  {
    id: 'george-saps',
    type: 'police',
    name: 'George SAPS',
    phone: '044 803 4400',
    town: 'george',
  },
  {
    id: 'george-fire',
    type: 'fire',
    name: 'George Municipality Fire & Rescue',
    phone: '044 801 6311',
    town: 'george',
  },

  // Wilderness
  {
    id: 'wilderness-saps',
    type: 'police',
    name: 'Wilderness SAPS',
    phone: '044 877 0011',
    town: 'wilderness',
  },
  {
    id: 'wilderness-nsri',
    type: 'nsri',
    name: 'NSRI Station 23 (Wilderness)',
    phone: '082 990 5955',
    town: 'wilderness',
  },

  // Sedgefield
  {
    id: 'sedgefield-saps',
    type: 'police',
    name: 'Sedgefield SAPS',
    phone: '044 302 6702',
    town: 'sedgefield',
  },
  {
    id: 'sedgefield-fire',
    type: 'fire',
    name: 'Sedgefield Fire Department',
    phone: '044 349 2900',
    town: 'sedgefield',
  },
  {
    id: 'sedgefield-nsri',
    type: 'nsri',
    name: 'NSRI Station 23 (Wilderness/Sedgefield)',
    phone: '082 990 5955',
    town: 'sedgefield',
  },

  // Knysna
  {
    id: 'knysna-saps',
    type: 'police',
    name: 'Knysna SAPS',
    phone: '044 302 6600',
    town: 'knysna',
  },
  {
    id: 'knysna-fire',
    type: 'fire',
    name: 'Knysna Fire & Rescue',
    phone: '044 302 8911',
    town: 'knysna',
  },
  {
    id: 'knysna-nsri',
    type: 'nsri',
    name: 'NSRI Station 12 (Knysna)',
    phone: '082 990 5956',
    town: 'knysna',
  },

  // Plettenberg Bay
  {
    id: 'plett-saps',
    type: 'police',
    name: 'Plettenberg Bay SAPS',
    phone: '044 501 1900',
    town: 'plett',
  },
  {
    id: 'plett-fire',
    type: 'fire',
    name: 'Bitou Fire Department (Plettenberg Bay)',
    phone: '044 533 5000',
    town: 'plett',
  },
  {
    id: 'plett-nsri',
    type: 'nsri',
    name: 'NSRI Station 14 (Plettenberg Bay)',
    phone: '082 990 5975',
    town: 'plett',
  },
];

// Generated from OpenStreetMap via scripts/import-emergency.mjs (police and
// fire stations per town). Do not edit by hand — re-run the script.
export const OSM_TOWN_CONTACTS: EmergencyContact[] = [];

export function getEmergencyContactsByTown(town: string): EmergencyContact[] {
  return [...CONFIRMED_TOWN_CONTACTS, ...OSM_TOWN_CONTACTS].filter(
    (c) => c.town === town
  );
}
