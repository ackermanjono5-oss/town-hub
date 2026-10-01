

export type EventCategory =
  | 'Community'
  | 'Food & Drink'
  | 'Sport'
  | 'Motorsport'
  | 'Music'
  | 'Arts'
  | 'Nightlife';

export const EVENT_CATEGORIES: EventCategory[] = [
  'Community',
  'Arts',
  'Music',
  'Food & Drink',
  'Sport',
  'Motorsport',
  'Nightlife',
];

export interface Event {
  id: string;
  name: string;
  category: EventCategory;
  /** Town slug from lib/garden-route/towns.ts. */
  town: string;
  venue?: string;
  /**
   * ISO start/end dates, used for sorting and the countdown. Absent for an
   * annual event whose next edition has not been announced — those are shown
   * separately rather than being given an invented date.
   */
  startDate?: string;
  endDate?: string;
  /** Human-readable date shown on the card. */
  dateLabel: string;
  /** Recurs every year. Pairs with a missing startDate to mean "dates TBC". */
  annual?: boolean;
  description: string;
  website?: string;
  logo?: string;
  /** Optional venue/crowd photo, rendered by components/DirectoryPhoto.tsx. */
  image?: string;
  /** Dates confirmed against the organiser's own site, not an aggregator. */
  verified?: boolean;
}

const ALL_EVENTS: Event[] = [
  // -------------------------------------------------------------------
  // Confirmed dates. Each `verified` entry was checked against the
  // organiser's own website; aggregator listings disagreed on several.
  // -------------------------------------------------------------------
  {
    id: 'plett-arts',
    name: 'Plett Arts Festival',
    category: 'Arts',
    town: 'plett',
    venue: "Melville's Corner, Main Street, Plettenberg Bay",
    startDate: '2026-09-25',
    endDate: '2026-10-04',
    dateLabel: '25 Sep – 4 Oct 2026',
    description:
      'Ten days of theatre, live music, exhibitions and workshops in and around Plettenberg Bay, under the banner "Connect in Plett".',
    website: 'https://www.plettartsfestival.co.za',
    logo: 'logos/events/plett-arts-festival.png',
    verified: true,
  },
  {
    id: 'karoo-to-coast',
    name: 'Lions Karoo to Coast',
    category: 'Sport',
    town: 'knysna',
    venue: "Uniondale to Knysna via Prince Alfred's Pass",
    startDate: '2026-09-27',
    dateLabel: '27 Sep 2026',
    description:
      "A 100km solo mountain bike challenge from Uniondale to Knysna over Prince Alfred's Pass. Proceeds go to Lions Club charities.",
    website: 'https://www.karootocoast.com',
    logo: 'logos/events/karoo-to-coast.png',
    verified: true,
  },
  {
    id: 'mosjazz',
    name: 'MosJazz Festival',
    category: 'Music',
    town: 'mossel-bay',
    startDate: '2026-11-26',
    endDate: '2026-11-29',
    dateLabel: '26 – 29 Nov 2026',
    description:
      'Four days of live jazz across Mossel Bay venues as the Cape South Coast summer season opens.',
    // Dates come from a regional listing rather than an organiser-run
    // domain, so this one is deliberately not marked verified.
  },
  {
    id: 'plett-rage',
    name: 'Plett Rage',
    category: 'Nightlife',
    town: 'plett',
    venue: 'Central Beach & Cairnbrogie, Plettenberg Bay',
    startDate: '2026-11-27',
    endDate: '2026-12-03',
    dateLabel: '27 Nov – 3 Dec 2026',
    description:
      "South Africa's biggest matric festival — a week of live music, beach parties and day events for school leavers.",
    website: 'https://plettrage.co.za',
    logo: 'logos/events/plett-rage.png',
    verified: true,
  },

  // -------------------------------------------------------------------
  // Annual events whose next edition has not been announced yet. Listed
  // with the month they normally run, never an invented date.
  // -------------------------------------------------------------------
  {
    id: 'knysna-oyster',
    name: 'Knysna Oyster Festival',
    category: 'Community',
    town: 'knysna',
    annual: true,
    dateLabel: 'July — dates to be confirmed',
    description:
      "The Garden Route's biggest annual event and Knysna's longest running: ten days of oysters, sport and family events. The 2026 edition ran 3 – 12 July.",
    website: 'https://www.knysnaoysterfestival.co.za',
    logo: 'logos/events/knysna-oyster-festival.png',
  },
  {
    id: 'plett-ocean',
    name: 'Plett Ocean Festival',
    category: 'Community',
    town: 'plett',
    annual: true,
    dateLabel: 'July — dates to be confirmed',
    description:
      'A celebration of marine conservation and coastal culture — excursions, symposiums and maritime art. The 2026 edition ran 3 – 12 July.',
    website: 'https://www.plettoceanfestival.co.za',
    logo: 'logos/events/plett-ocean-festival.png',
  },
  {
    id: 'simola-hillclimb',
    name: 'Simola Hillclimb',
    category: 'Motorsport',
    town: 'knysna',
    venue: 'Simola Hill, Knysna',
    annual: true,
    dateLabel: 'April / May — dates to be confirmed',
    description:
      "South Africa's premier motorsport lifestyle event, run up Simola Hill above Knysna. The 2026 edition ran 30 April – 3 May.",
    website: 'https://www.speedfestival.co.za',
    logo: 'logos/events/simola-hillclimb.png',
  },
  {
    id: 'plett-wine-bubbly',
    name: 'Plett Wine & Bubbly Festival',
    category: 'Food & Drink',
    town: 'plett',
    annual: true,
    dateLabel: 'October — dates to be confirmed',
    description:
      'Tastings of Wine of Origin Plettenberg Bay wines with live music and local food, run by the Plett Wine Route and Plett Tourism.',
    website: 'https://www.plett-tourism.co.za/events/plett-wine-bubbly-festival/',
  },
];

export const EVENTS: Event[] = ALL_EVENTS;

export type EventStatus = 'on-now' | 'upcoming' | 'past' | 'annual';

/** Midnight today, so an event running today still counts as on now. */
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEventStatus(event: Event, now = startOfToday()): EventStatus {
  if (!event.startDate) return 'annual';
  const start = new Date(`${event.startDate}T00:00:00`);
  const end = new Date(`${event.endDate ?? event.startDate}T23:59:59`);
  if (now > end) return 'past';
  if (now >= start) return 'on-now';
  return 'upcoming';
}

/** Whole days until an event starts; null once it has started. */
export function daysUntil(event: Event, now = startOfToday()): number | null {
  if (!event.startDate) return null;
  const start = new Date(`${event.startDate}T00:00:00`);
  const diff = Math.ceil((start.getTime() - now.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

/**
 * Dated events first in date order (on-now before upcoming), then annual
 * events with unconfirmed dates, then anything that has already finished.
 */
const STATUS_ORDER: Record<EventStatus, number> = {
  'on-now': 0,
  upcoming: 1,
  annual: 2,
  past: 3,
};

export function sortEvents(events: Event[], now = startOfToday()): Event[] {
  return [...events].sort((a, b) => {
    const byStatus =
      STATUS_ORDER[getEventStatus(a, now)] - STATUS_ORDER[getEventStatus(b, now)];
    if (byStatus !== 0) return byStatus;
    if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
    return a.name.localeCompare(b.name);
  });
}

export function getEventsByTown(town: string): Event[] {
  return EVENTS.filter((e) => e.town === town);
}

/**
 * Google Calendar "add event" link. Chosen over generating an .ics file
 * because the app runs from file:// inside a WebView, where a Blob/data
 * download is unreliable — an external URL is handed to the OS instead.
 * All-day events use an exclusive end date, hence the +1 day.
 */
export function getAddToCalendarUrl(event: Event): string | null {
  if (!event.startDate) return null;
  const compact = (iso: string) => iso.replace(/-/g, '');
  // Built in UTC throughout: constructing a local Date and then calling
  // toISOString() shifts the day backwards for any timezone ahead of UTC,
  // which silently ended every multi-day event a day early.
  const [y, m, d] = (event.endDate ?? event.startDate).split('-').map(Number);
  const endExclusive = new Date(Date.UTC(y, m - 1, d + 1));
  const end = compact(endExclusive.toISOString().slice(0, 10));

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${compact(event.startDate)}/${end}`,
    details: event.website ? `${event.description}\n\n${event.website}` : event.description,
  });
  if (event.venue) params.set('location', event.venue);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
