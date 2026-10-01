import { OSM_MARKETS } from './markets-osm';

export interface Market {
  id: string;
  name: string;
  type: string;
  town: string;
  /** Day and time it runs. OSM rarely records this, so curated entries win. */
  schedule?: string;
  location?: string;
  description?: string;
  website?: string;
  lat?: number;
  lng?: number;
}

/**
 * Hand-written markets. These stay authoritative over the OpenStreetMap
 * import because a market's value is its day and time, which OSM almost never
 * records — `schedule` here is the whole point of keeping them by hand.
 *
 * `supersedes` lists OSM names this entry replaces, matched case-insensitively
 * within the same town, so the same market never appears twice.
 */
const CURATED_MARKETS: (Market & { supersedes?: string[] })[] = [
  {
    id: 'wild-oats',
    name: "Wild Oats Community Farmers' Market",
    type: 'Farmers Market',
    town: 'sedgefield',
    schedule: 'Saturdays, 07:30 – 11:30',
    location: 'N2, Sedgefield',
    description:
      "One of South Africa's best-known farmers' markets — fresh produce, baked goods, cheeses and breakfast stalls, running since 1997.",
    supersedes: ['Wild Oats Community Farmers Market', 'Wild Oats Market'],
  },
  {
    id: 'mosaic-village',
    name: 'Mosaic Village & Outdoor Market',
    type: 'Craft & Food',
    town: 'sedgefield',
    schedule: 'Saturdays, 08:00 – 14:00',
    location: 'Sedgefield',
    description: 'Local crafts, clothing and artisanal food in the village centre.',
    supersedes: ['Mosaic Market'],
  },
];

const SUPERSEDED = new Set(
  CURATED_MARKETS.flatMap((m) =>
    (m.supersedes ?? []).map((name) => `${m.town}|${name.toLowerCase()}`)
  )
);

export const MARKETS: Market[] = [
  ...CURATED_MARKETS,
  ...OSM_MARKETS.filter((m) => !SUPERSEDED.has(`${m.town}|${m.name.toLowerCase()}`)),
];

export function getMarketsByTown(town: string): Market[] {
  return MARKETS.filter((m) => m.town === town);
}

export function getMarketMapsUrl(market: Market): string {
  const query =
    market.lat !== undefined && market.lng !== undefined
      ? `${market.lat},${market.lng}`
      : `${market.name} ${market.location ?? ''}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
