/**
 * How listings without a logo are treated across the directories.
 *
 * Most Garden Route listings are independent businesses with no web presence,
 * so no logo exists for them and their cards fall back to a monogram. Filtering
 * those out entirely emptied whole towns — Hartenbos lost all 24 of its
 * restaurants, Mossel Bay showed 2 of 55 — so instead of hiding them, listings
 * that have a real logo are simply sorted to the front of each town.
 *
 * Nothing is hidden: every imported listing is reachable, branded ones just
 * lead. Set this to `false` to keep the raw import order.
 */
export const LOGOS_FIRST = true;

/**
 * Stable sort putting listings with a logo first. Array.prototype.sort is
 * stable, so the existing order (alphabetical, by town, by category) is
 * preserved within each of the two groups.
 */
export function logoFirst<T>(items: T[], getLogo: (item: T) => string | undefined): T[] {
  if (!LOGOS_FIRST) return items;
  return [...items].sort((a, b) => Number(Boolean(getLogo(b))) - Number(Boolean(getLogo(a))));
}

/** Convenience for the hero stats: how many of a list carry a real logo. */
export function countWithLogos<T>(
  items: T[],
  getLogo: (item: T) => string | undefined
): number {
  return items.reduce((n, item) => n + (getLogo(item) ? 1 : 0), 0);
}
