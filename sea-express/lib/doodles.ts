// The daily "doodle" in the header: like Google's, the wordmark changes with
// the day. South African public holidays and well-known days get their own
// design; other days rotate through Garden Route scenes that suit the season.
// Everything is drawn in code (components/DailyDoodle.tsx), so it works
// offline in the Android app.

import { TOWNS } from '@/lib/garden-route/towns';

export type DoodleGlyph =
  | 'wave'
  | 'sun'
  | 'lifebuoy'
  | 'protea'
  | 'compass'
  | 'beachball'
  | 'heart'
  | 'flag'
  | 'gear'
  | 'flame'
  | 'firework'
  | 'bauble'
  | 'egg';

export type DoodleAccent = 'whale' | 'boat' | 'gull' | 'sparkles' | 'none';

export interface Doodle {
  id: string;
  /** Drawn in place of the "o" in "Town". */
  glyph: DoodleGlyph;
  /** Small animated detail after the wordmark. */
  accent: DoodleAccent;
  /** One line under the wordmark. Kept short: it shares a phone-width header. */
  caption: string;
  /** Letter colours for T, w, n, H, u, b. */
  letters: [string, string, string, string, string, string];
  /** Caption colour. */
  tint: string;
  /** Shown in the scene card when the doodle is tapped. */
  fact: string;
  /** Holidays get confetti and bunting in the scene card. */
  holiday?: boolean;
}

const OCEAN: Doodle['letters'] = ['#0e7490', '#0891b2', '#0e7490', '#f59e0b', '#0e7490', '#0891b2'];
const SUNSET: Doodle['letters'] = ['#ea580c', '#f59e0b', '#e11d48', '#0e7490', '#f59e0b', '#ea580c'];
const FYNBOS: Doodle['letters'] = ['#be185d', '#15803d', '#be185d', '#15803d', '#db2777', '#15803d'];
// The flag's own colours: green, gold, red, blue and black.
const FLAG: Doodle['letters'] = ['#007749', '#FFB81C', '#E03C31', '#001489', '#007749', '#E03C31'];
const FESTIVE: Doodle['letters'] = ['#b91c1c', '#15803d', '#ca8a04', '#b91c1c', '#15803d', '#ca8a04'];
const PARTY: Doodle['letters'] = ['#7c3aed', '#db2777', '#f59e0b', '#0891b2', '#7c3aed', '#db2777'];

/** Rotating scenes for ordinary days. `months` limits a scene to its season. */
const EVERYDAY: (Doodle & { months?: number[] })[] = [
  {
    id: 'ocean',
    glyph: 'wave',
    accent: 'gull',
    caption: 'Fresh sea air on the Garden Route',
    letters: OCEAN,
    tint: '#0e7490',
    fact: "The Garden Route stretches roughly 300 km along the coast, from Mossel Bay to Storms River.",
  },
  {
    id: 'sunny',
    glyph: 'sun',
    accent: 'boat',
    caption: 'Sunshine along the coast today',
    letters: SUNSET,
    tint: '#ea580c',
    fact: "Mossel Bay is known for its mild, sunny climate all year round.",
  },
  {
    id: 'whales',
    glyph: 'wave',
    accent: 'whale',
    caption: 'Whale season: keep an eye on the bay',
    letters: OCEAN,
    tint: '#0369a1',
    fact: "Southern right whales come into the Garden Route's bays from about June to November to calve.",
    months: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 'fynbos',
    glyph: 'protea',
    accent: 'sparkles',
    caption: 'Proudly fynbos country',
    letters: FYNBOS,
    tint: '#be185d',
    fact: "The Cape Floral Kingdom is the smallest of the world's six floral kingdoms, and the richest for its size. The king protea is South Africa's national flower.",
  },
  {
    id: 'lifeguard',
    glyph: 'lifebuoy',
    accent: 'boat',
    caption: 'Swim safe: stay between the flags',
    letters: ['#dc2626', '#0e7490', '#dc2626', '#0e7490', '#dc2626', '#0e7490'],
    tint: '#dc2626',
    fact: "Swim at beaches where lifeguards are on duty, and stay between the red-and-yellow flags.",
    months: [11, 12, 1, 2, 3, 4],
  },
  {
    id: 'explore',
    glyph: 'compass',
    accent: 'gull',
    caption: 'Explore a new town this week',
    letters: ['#0f766e', '#0e7490', '#0f766e', '#b45309', '#0f766e', '#0e7490'],
    tint: '#0f766e',
    fact: `Town Hub covers ${TOWNS.length} towns, from Witsand to Storms River. Which one will you visit next?`,
  },
  {
    id: 'beach',
    glyph: 'beachball',
    accent: 'sparkles',
    caption: 'Beach weather? Check the forecast',
    letters: PARTY,
    tint: '#7c3aed',
    fact: "Check the Weather page for today's forecast before you head to the beach.",
    months: [10, 11, 12, 1, 2, 3, 4],
  },
];

/** Fixed-date days, keyed "MM-DD". */
const FIXED: Record<string, Doodle> = {
  '01-01': {
    id: 'new-year',
    glyph: 'firework',
    accent: 'sparkles',
    caption: 'Happy New Year from the Garden Route!',
    letters: PARTY,
    tint: '#7c3aed',
    fact: "Wishing every town on the Garden Route a safe and happy new year.",
  },
  '02-14': {
    id: 'valentines',
    glyph: 'heart',
    accent: 'sparkles',
    caption: "Happy Valentine's Day",
    letters: ['#e11d48', '#db2777', '#e11d48', '#db2777', '#e11d48', '#db2777'],
    tint: '#e11d48',
    fact: "Treat someone special to a meal at one of the Garden Route's restaurants. Find one in the Restaurants directory.",
  },
  '03-21': {
    id: 'human-rights',
    glyph: 'flag',
    accent: 'none',
    caption: 'Human Rights Day',
    letters: FLAG,
    tint: '#007749',
    fact: "Human Rights Day remembers 21 March 1960 in Sharpeville, and the rights in South Africa's Constitution.",
  },
  '04-27': {
    id: 'freedom',
    glyph: 'flag',
    accent: 'sparkles',
    caption: 'Happy Freedom Day, South Africa!',
    letters: FLAG,
    tint: '#007749',
    fact: "Freedom Day marks South Africa's first democratic election, held on 27 April 1994.",
  },
  '05-01': {
    id: 'workers',
    glyph: 'gear',
    accent: 'none',
    caption: "Workers' Day: thank you, Garden Route",
    letters: ['#b45309', '#475569', '#b45309', '#475569', '#b45309', '#475569'],
    tint: '#b45309',
    fact: "Workers' Day honours the people who keep our towns running, every day of the year.",
  },
  '06-16': {
    id: 'youth',
    glyph: 'sun',
    accent: 'sparkles',
    caption: "Youth Day: honouring the class of '76",
    letters: SUNSET,
    tint: '#ea580c',
    fact: "Youth Day remembers the Soweto uprising of 16 June 1976, when students protested for a better education.",
  },
  '07-18': {
    id: 'mandela',
    glyph: 'heart',
    accent: 'sparkles',
    caption: 'Mandela Day: 67 minutes for good',
    letters: FLAG,
    tint: '#007749',
    fact: "Mandela Day falls on Nelson Mandela's birthday. Give 67 minutes, one for each year of his public service.",
  },
  '08-09': {
    id: 'womens',
    glyph: 'protea',
    accent: 'sparkles',
    caption: "Happy National Women's Day",
    letters: FYNBOS,
    tint: '#be185d',
    fact: "Women's Day remembers the march of about 20,000 women to the Union Buildings on 9 August 1956.",
  },
  '09-24': {
    id: 'heritage',
    glyph: 'flame',
    accent: 'none',
    caption: 'Happy Heritage Day: light the braai!',
    letters: FLAG,
    tint: '#ea580c',
    fact: "Heritage Day celebrates South Africa's many cultures. It's also popularly known as National Braai Day.",
  },
  '12-16': {
    id: 'reconciliation',
    glyph: 'flag',
    accent: 'none',
    caption: 'Day of Reconciliation',
    letters: FLAG,
    tint: '#007749',
    fact: "The Day of Reconciliation promotes national unity, and has been a public holiday since 1995.",
  },
  '12-24': {
    id: 'christmas-eve',
    glyph: 'bauble',
    accent: 'sparkles',
    caption: 'Merry Christmas Eve!',
    letters: FESTIVE,
    tint: '#b91c1c',
    fact: "Wishing everyone on the Garden Route a safe and happy festive season.",
  },
  '12-25': {
    id: 'christmas',
    glyph: 'bauble',
    accent: 'sparkles',
    caption: 'Merry Christmas from Town Hub',
    letters: FESTIVE,
    tint: '#b91c1c',
    fact: "Wishing everyone on the Garden Route a safe and happy festive season.",
  },
  '12-26': {
    id: 'goodwill',
    glyph: 'heart',
    accent: 'none',
    caption: 'Day of Goodwill',
    letters: FESTIVE,
    tint: '#15803d',
    fact: "A day for kindness. Check on a neighbour, or lend a hand in your town.",
  },
  '12-31': {
    id: 'new-years-eve',
    glyph: 'firework',
    accent: 'sparkles',
    caption: "New Year's Eve: see you in the new year!",
    letters: PARTY,
    tint: '#7c3aed',
    fact: "Celebrate safely tonight. Save the emergency numbers on the SOS page before you head out.",
  },
};

const EASTER: Doodle = {
  id: 'easter',
  glyph: 'egg',
  accent: 'sparkles',
  caption: 'Happy Easter',
  letters: ['#7c3aed', '#16a34a', '#db2777', '#0891b2', '#f59e0b', '#7c3aed'],
  tint: '#7c3aed',
  fact: "Wishing every town on the Garden Route a peaceful Easter weekend.",
};

export const DEFAULT_DOODLE: Doodle = EVERYDAY[0];

/** Easter Sunday (Gregorian), as [month, day]. Anonymous Gregorian algorithm. */
function easterSunday(year: number): [number, number] {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return [month, day];
}

/** Today's date and hour in South Africa, whatever the device's time zone. */
export function southAfricaNow(now: Date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
  };
}

for (const d of [...Object.values(FIXED), EASTER]) d.holiday = true;

const ALL_DOODLES: Doodle[] = [...EVERYDAY, ...Object.values(FIXED), EASTER];

/** Looks a doodle up by id, for previewing with ?doodle=<id>. */
export function findDoodle(id: string): Doodle | undefined {
  return ALL_DOODLES.find((d) => d.id === id);
}

export function pickDoodle(now: Date = new Date()): Doodle & { night: boolean } {
  const { year, month, day, hour } = southAfricaNow(now);
  const night = hour >= 19 || hour < 5;
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (FIXED[key]) return { ...FIXED[key], night };

  // Good Friday to Family Day (Easter Monday).
  const [em, ed] = easterSunday(year);
  const easter = Date.UTC(year, em - 1, ed);
  const today = Date.UTC(year, month - 1, day);
  const offset = Math.round((today - easter) / 86_400_000);
  if (offset >= -2 && offset <= 1) return { ...EASTER, night };

  // Same scene all day, a different one tomorrow.
  const eligible = EVERYDAY.filter((d) => !d.months || d.months.includes(month));
  const dayOfYear = Math.round((today - Date.UTC(year, 0, 1)) / 86_400_000);
  const pick = eligible[dayOfYear % eligible.length];

  // The sunny scene becomes a moonlit one after dark.
  if (night && pick.glyph === 'sun') {
    return { ...pick, caption: 'Goodnight from the Garden Route', night };
  }
  return { ...pick, night };
}
