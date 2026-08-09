export const TOWNS = [
  { slug: 'mossel-bay', prefix: 'mb', lat: -34.1814, lng: 22.146, label: 'Mossel Bay' },
  { slug: 'george', prefix: 'geo', lat: -33.963, lng: 22.4617, label: 'George' },
  { slug: 'wilderness', prefix: 'wild', lat: -33.9989, lng: 22.58, label: 'Wilderness' },
  { slug: 'sedgefield', prefix: 'sedge', lat: -34.0146, lng: 22.7939, label: 'Sedgefield' },
  { slug: 'knysna', prefix: 'kny', lat: -34.0363, lng: 23.0471, label: 'Knysna' },
  { slug: 'plett', prefix: 'plett', lat: -34.0527, lng: 23.3716, label: 'Plettenberg Bay' },
];

export type Town = typeof TOWNS[number];

export function getTownLabel(slug: string) {
  const town = TOWNS.find(t => t.slug === slug);
  return town ? town.label : slug;
}