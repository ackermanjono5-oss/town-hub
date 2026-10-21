import { BUSINESSES } from '@/lib/garden-route/businesses';
import { RESTAURANTS } from '@/lib/garden-route/restaurants';
import { ACCOMMODATION } from '@/lib/garden-route/accommodation';
import { MEDICAL_FACILITIES } from '@/lib/garden-route/medical';
import { ATTORNEYS } from '@/lib/garden-route/attorneys';
import { getTownLabel } from '@/lib/garden-route/towns';

/**
 * Every listing in the app's directories, so a business registering for
 * rewards can link its existing listing. Ids are prefixed with their source
 * because the separate imports reuse the same id shapes (e.g. "wits-10").
 *
 * Loaded with a dynamic import from the registration form — it pulls in all
 * the directory data, which no other portal screen needs.
 */
export interface DirectoryListing {
  id: string;
  name: string;
  townLabel: string;
  kind: string;
}

export const DIRECTORY_LISTINGS: DirectoryListing[] = [
  ...BUSINESSES.map((b) => ({ id: `business:${b.id}`, name: b.name, townLabel: getTownLabel(b.town), kind: b.category })),
  ...RESTAURANTS.map((r) => ({ id: `restaurant:${r.id}`, name: r.name, townLabel: getTownLabel(r.town), kind: r.category })),
  ...ACCOMMODATION.map((a) => ({ id: `stay:${a.id}`, name: a.name, townLabel: getTownLabel(a.town), kind: a.category })),
  ...MEDICAL_FACILITIES.map((m) => ({ id: `medical:${m.id}`, name: m.name, townLabel: getTownLabel(m.town), kind: m.category })),
  ...ATTORNEYS.map((a) => ({ id: `attorney:${a.id}`, name: a.name, townLabel: getTownLabel(a.town), kind: 'Attorney' })),
];

export function searchDirectoryListings(query: string, limit = 12): DirectoryListing[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const starts: DirectoryListing[] = [];
  const contains: DirectoryListing[] = [];
  for (const listing of DIRECTORY_LISTINGS) {
    const name = listing.name.toLowerCase();
    if (name.startsWith(q)) starts.push(listing);
    else if (name.includes(q)) contains.push(listing);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

export function findDirectoryListing(id: string | null | undefined): DirectoryListing | undefined {
  return id ? DIRECTORY_LISTINGS.find((l) => l.id === id) : undefined;
}
