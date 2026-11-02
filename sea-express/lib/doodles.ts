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
  /** When it happens, shown in the scene card, e.g. "All of September". */
  when?: string;
  /** Where it happens, for the scene card's heading. Defaults to the Garden Route. */
  place?: string;
  /** Holidays get confetti and bunting in the scene card. */
  holiday?: boolean;
}

const SUNSET: Doodle['letters'] = ['#ea580c', '#f59e0b', '#e11d48', '#0e7490', '#f59e0b', '#ea580c'];
const FYNBOS: Doodle['letters'] = ['#be185d', '#15803d', '#be185d', '#15803d', '#db2777', '#15803d'];
// The flag's own colours: green, gold, red, blue and black.
const FLAG: Doodle['letters'] = ['#007749', '#FFB81C', '#E03C31', '#001489', '#007749', '#E03C31'];
const FESTIVE: Doodle['letters'] = ['#b91c1c', '#15803d', '#ca8a04', '#b91c1c', '#15803d', '#ca8a04'];
const PARTY: Doodle['letters'] = ['#7c3aed', '#db2777', '#f59e0b', '#0891b2', '#7c3aed', '#db2777'];

/** Rotating scenes for ordinary days. `months` limits a scene to its season. */
// Ordinary days keep the wordmark calm: "Town" in navy, "Hub" in the day's
// colour. Holidays use their full palettes, so they stand out.
const NAVY = '#0f3d5e';
function calm(tint: string): Doodle['letters'] {
  return [NAVY, NAVY, NAVY, tint, tint, tint];
}

const EVERYDAY: (Doodle & { months?: number[] })[] = [
  {
    id: 'ocean',
    glyph: 'wave',
    accent: 'gull',
    caption: 'Fresh sea air on the Garden Route',
    letters: calm('#0e7490'),
    tint: '#0e7490',
    fact: "The Garden Route stretches roughly 300 km along the coast, from Mossel Bay to Storms River.",
  },
  {
    id: 'sunny',
    glyph: 'sun',
    accent: 'boat',
    caption: 'Sunshine along the coast today',
    letters: calm('#ea580c'),
    tint: '#ea580c',
    fact: "Mossel Bay is known for its mild, sunny climate all year round.",
  },
  {
    id: 'whales',
    glyph: 'wave',
    accent: 'whale',
    caption: 'Whale season: keep an eye on the bay',
    letters: calm('#0369a1'),
    tint: '#0369a1',
    fact: "Southern right whales come into the Garden Route's bays from about June to November to calve.",
    months: [6, 7, 8, 9, 10, 11],
  },
  {
    id: 'fynbos',
    glyph: 'protea',
    accent: 'sparkles',
    caption: 'Proudly fynbos country',
    letters: calm('#be185d'),
    tint: '#be185d',
    fact: "The Cape Floral Kingdom is the smallest of the world's six floral kingdoms, and the richest for its size. The king protea is South Africa's national flower.",
  },
  {
    id: 'lifeguard',
    glyph: 'lifebuoy',
    accent: 'boat',
    caption: 'Swim safe: stay between the flags',
    letters: calm('#dc2626'),
    tint: '#dc2626',
    fact: "Swim at beaches where lifeguards are on duty, and stay between the red-and-yellow flags.",
    months: [11, 12, 1, 2, 3, 4],
  },
  {
    id: 'explore',
    glyph: 'compass',
    accent: 'gull',
    caption: 'Explore a new town this week',
    letters: calm('#0f766e'),
    tint: '#0f766e',
    fact: `Town Hub covers ${TOWNS.length} towns, from Witsand to Storms River. Which one will you visit next?`,
  },
  {
    id: 'beach',
    glyph: 'beachball',
    accent: 'sparkles',
    caption: 'Beach weather? Check the forecast',
    letters: calm('#7c3aed'),
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

/**
 * What's happening in South Africa and on the Garden Route at this time of
 * year: national months and days, festivals and nature's big events. Dates
 * are "MM-DD" and inclusive; a range can run over New Year. Events whose
 * dates move from year to year are written as "usually" and "around".
 *
 * On a day covered by one of these, it's shown instead of an everyday
 * scene. A short one (3 days or fewer) wins outright; otherwise the
 * matching ones take turns, a different one each day.
 */
interface Happening extends Doodle {
  from: string;
  to: string;
}

const ZA = 'South Africa';

const HAPPENINGS: Happening[] = [
  {
    id: 'summer-holidays',
    from: '12-10',
    to: '01-12',
    glyph: 'beachball',
    accent: 'boat',
    caption: 'Summer holidays: the coast is busy',
    when: 'Mid-December to mid-January',
    letters: calm('#ea580c'),
    tint: '#ea580c',
    fact: "This is the Garden Route's busiest season, when holidaymakers from across the country head for its beaches. Expect busy roads on the N2, book restaurants ahead, and swim only where lifeguards are on duty.",
  },
  {
    id: 'back-to-school',
    from: '01-13',
    to: '01-31',
    glyph: 'compass',
    accent: 'none',
    caption: 'Back to school after summer',
    when: 'Mid to late January',
    letters: calm('#0f766e'),
    tint: '#0f766e',
    place: ZA,
    fact: 'Schools reopen after the long summer break, and matric results come out around this time. Drive carefully near schools as the roads fill with learners again.',
  },
  {
    id: 'wetlands-day',
    from: '02-02',
    to: '02-02',
    glyph: 'wave',
    accent: 'gull',
    caption: 'World Wetlands Day',
    when: '2 February',
    letters: calm('#0e7490'),
    tint: '#0e7490',
    fact: 'The Wilderness lakes, between George and Sedgefield, are a Ramsar wetland of international importance and home to many water birds. World Wetlands Day marks the signing of the Ramsar Convention on 2 February 1971.',
  },
  {
    id: 'old-car-show',
    from: '02-06',
    to: '02-16',
    glyph: 'gear',
    accent: 'sparkles',
    caption: 'Classic cars gather in George',
    when: 'Usually in February',
    letters: calm('#b45309'),
    tint: '#b45309',
    fact: 'The George Old Car Show, a much-loved classic-car show, is usually held in February, drawing collectors and families from across South Africa.',
  },
  {
    id: 'human-rights-month',
    from: '03-01',
    to: '03-31',
    glyph: 'flag',
    accent: 'none',
    caption: 'Human Rights Month',
    when: 'All of March',
    letters: FLAG,
    tint: '#007749',
    place: ZA,
    fact: "March is Human Rights Month in South Africa, built around Human Rights Day on 21 March. It's a time to reflect on the rights every person has under the Constitution.",
  },
  {
    id: 'water-day',
    from: '03-22',
    to: '03-22',
    glyph: 'wave',
    accent: 'none',
    caption: 'World Water Day: save every drop',
    when: '22 March',
    letters: calm('#0369a1'),
    tint: '#0369a1',
    place: ZA,
    fact: "South Africa is a water-scarce country. Fix leaks, take shorter showers and keep an eye on your town's water restrictions.",
  },
  {
    id: 'kknk',
    from: '03-28',
    to: '04-10',
    glyph: 'firework',
    accent: 'sparkles',
    caption: 'Arts festival time in Oudtshoorn',
    when: 'Usually late March or April',
    letters: calm('#7c3aed'),
    tint: '#7c3aed',
    fact: "The Klein Karoo Nasionale Kunstefees (KKNK), one of South Africa's biggest arts festivals, is usually held in Oudtshoorn around this time, with theatre, music and art.",
  },
  {
    id: 'freedom-month',
    from: '04-01',
    to: '04-30',
    glyph: 'flag',
    accent: 'sparkles',
    caption: 'Freedom Month',
    when: 'All of April',
    letters: FLAG,
    tint: '#007749',
    place: ZA,
    fact: "April is Freedom Month, marking South Africa's first democratic election on 27 April 1994, when millions queued to vote for the first time.",
  },
  {
    id: 'africa-day',
    from: '05-25',
    to: '05-25',
    glyph: 'heart',
    accent: 'sparkles',
    caption: 'Happy Africa Day!',
    when: '25 May',
    letters: FLAG,
    tint: '#007749',
    place: ZA,
    fact: "Africa Day marks the founding of the Organisation of African Unity on 25 May 1963, today's African Union, and celebrates the continent's people and cultures.",
  },
  {
    id: 'youth-month',
    from: '06-01',
    to: '06-30',
    glyph: 'sun',
    accent: 'none',
    caption: 'Youth Month',
    when: 'All of June',
    letters: SUNSET,
    tint: '#ea580c',
    place: ZA,
    fact: 'June is Youth Month, honouring the students of the 1976 Soweto uprising and the young people shaping South Africa today.',
  },
  {
    id: 'environment-day',
    from: '06-05',
    to: '06-05',
    glyph: 'protea',
    accent: 'none',
    caption: 'World Environment Day',
    when: '5 June',
    letters: calm('#15803d'),
    tint: '#15803d',
    fact: "From fynbos to indigenous forest, the Garden Route has some of the country's most precious natural areas, much of it protected in the Garden Route National Park.",
  },
  {
    id: 'oceans-day',
    from: '06-08',
    to: '06-08',
    glyph: 'wave',
    accent: 'whale',
    caption: 'World Oceans Day',
    when: '8 June',
    letters: calm('#0369a1'),
    tint: '#0369a1',
    fact: 'Take your litter home from the beach, and choose sustainable seafood: the SASSI list shows which fish are green-listed.',
  },
  {
    id: 'sardine-run',
    from: '06-10',
    to: '07-31',
    glyph: 'wave',
    accent: 'gull',
    caption: 'The sardine run is on',
    when: 'Winter, about June to July',
    letters: calm('#0e7490'),
    tint: '#0e7490',
    place: ZA,
    fact: "Every winter, huge shoals of sardines move up the east coast, chased by dolphins, sharks, seals and seabirds. It's one of the great wildlife spectacles on the planet, best seen off the Eastern Cape and KwaZulu-Natal.",
  },
  {
    id: 'oyster-festival',
    from: '07-01',
    to: '07-12',
    glyph: 'compass',
    accent: 'boat',
    caption: 'Oyster festival season in Knysna',
    when: 'Usually in July',
    letters: calm('#0f766e'),
    tint: '#0f766e',
    fact: 'The Knysna Oyster Festival usually runs over about ten days in July, with oyster tastings, the Knysna Forest Marathon and plenty to do across town.',
  },
  {
    id: 'mandela-month',
    from: '07-01',
    to: '07-31',
    glyph: 'heart',
    accent: 'none',
    caption: 'Mandela Month: do some good',
    when: 'All of July',
    letters: FLAG,
    tint: '#007749',
    place: ZA,
    fact: "July is Mandela Month. Mandela Day on 18 July asks everyone to give 67 minutes of service, one for every year of Nelson Mandela's public life.",
  },
  {
    id: 'womens-month',
    from: '08-01',
    to: '08-31',
    glyph: 'protea',
    accent: 'sparkles',
    caption: "Women's Month",
    when: 'All of August',
    letters: FYNBOS,
    tint: '#be185d',
    place: ZA,
    fact: "August is Women's Month, remembering the 20,000 women who marched to the Union Buildings on 9 August 1956 against the pass laws.",
  },
  {
    id: 'wildflowers',
    from: '08-01',
    to: '09-15',
    glyph: 'protea',
    accent: 'sparkles',
    caption: 'Wildflower season up the West Coast',
    when: 'Usually August to September',
    letters: calm('#be185d'),
    tint: '#be185d',
    place: ZA,
    fact: "After the winter rain, Namaqualand and the West Coast burst into carpets of spring flowers. It's one of South Africa's great natural shows.",
  },
  {
    id: 'spring-day',
    from: '09-01',
    to: '09-01',
    glyph: 'protea',
    accent: 'sparkles',
    caption: 'Happy Spring Day!',
    when: '1 September',
    letters: FYNBOS,
    tint: '#be185d',
    place: ZA,
    fact: "South Africans celebrate 1 September as the first day of spring. Look out for blooming fynbos on the Garden Route's trails.",
  },
  {
    id: 'arbor-week',
    from: '09-02',
    to: '09-07',
    glyph: 'protea',
    accent: 'none',
    caption: 'Arbor Week: plant a tree',
    when: '1 to 7 September',
    letters: calm('#15803d'),
    tint: '#15803d',
    fact: "Plant an indigenous tree this week, such as the real yellowwood: South Africa's national tree, which grows in the Garden Route's forests.",
  },
  {
    id: 'heritage-month',
    from: '09-01',
    to: '09-30',
    glyph: 'flame',
    accent: 'none',
    caption: 'Heritage Month',
    when: 'All of September',
    letters: FLAG,
    tint: '#ea580c',
    place: ZA,
    fact: 'September is Heritage Month, celebrating the languages, food, music and traditions that make up South Africa, leading up to Heritage Day on 24 September.',
  },
  {
    id: 'whale-peak',
    from: '09-15',
    to: '10-31',
    glyph: 'wave',
    accent: 'whale',
    caption: 'Peak whale-watching season',
    when: 'Spring, about September to October',
    letters: calm('#0369a1'),
    tint: '#0369a1',
    fact: "Southern right whales are often seen close to shore in the Garden Route's bays in spring, especially around Plettenberg Bay and Mossel Bay. Look for blows and breaching from the cliffs.",
  },
  {
    id: 'marine-month',
    from: '10-01',
    to: '10-31',
    glyph: 'lifebuoy',
    accent: 'boat',
    caption: 'National Marine Month',
    when: 'All of October',
    letters: calm('#0e7490'),
    tint: '#0e7490',
    place: ZA,
    fact: "October is National Marine Month, a time to celebrate and protect South Africa's oceans and coastline, home to thousands of marine species.",
  },
  {
    id: 'jacarandas',
    from: '10-15',
    to: '11-15',
    glyph: 'protea',
    accent: 'sparkles',
    caption: 'Jacarandas are blooming in Pretoria',
    when: 'Mid-October to mid-November',
    letters: calm('#7c3aed'),
    tint: '#7c3aed',
    place: ZA,
    fact: "Each spring, Pretoria's streets turn purple as thousands of jacaranda trees flower, which is why it's known as Jacaranda City.",
  },
  {
    id: 'matric-exams',
    from: '10-27',
    to: '11-28',
    glyph: 'compass',
    accent: 'none',
    caption: 'Good luck, matrics!',
    when: 'Late October to late November',
    letters: calm('#0f766e'),
    tint: '#0f766e',
    place: ZA,
    fact: 'Matric final exams run from late October into late November. Good luck to every Grade 12 learner sitting their exams.',
  },
  {
    id: 'sixteen-days',
    from: '11-25',
    to: '12-10',
    glyph: 'heart',
    accent: 'none',
    caption: '16 Days of Activism',
    when: '25 November to 10 December',
    letters: FYNBOS,
    tint: '#be185d',
    place: ZA,
    fact: 'South Africa joins the 16 Days of Activism for No Violence against Women and Children. If you or someone you know needs help, call the GBV Command Centre on 0800 428 428.',
  },
  {
    id: 'aids-day',
    from: '12-01',
    to: '12-01',
    glyph: 'heart',
    accent: 'none',
    caption: 'World AIDS Day',
    when: '1 December',
    letters: calm('#dc2626'),
    tint: '#dc2626',
    place: ZA,
    fact: 'World AIDS Day remembers those lost and supports people living with HIV. Free, confidential testing is available at public clinics.',
  },
];

/** Day of the year for an "MM-DD", in a non-leap year (1–365). */
function dayNumber(mmdd: string): number {
  const [m, d] = mmdd.split('-').map(Number);
  return Math.round((Date.UTC(2001, m - 1, d) - Date.UTC(2001, 0, 1)) / 86_400_000) + 1;
}

function covers(h: Happening, mmdd: string): boolean {
  const day = dayNumber(mmdd);
  const from = dayNumber(h.from);
  const to = dayNumber(h.to);
  return from <= to ? day >= from && day <= to : day >= from || day <= to;
}

function lengthInDays(h: Happening): number {
  const from = dayNumber(h.from);
  const to = dayNumber(h.to);
  return (from <= to ? to - from : 365 - from + to) + 1;
}

/** The happening to show on a day ("MM-DD"), or null when none covers it. */
export function happeningOn(mmdd: string, rotation = 0): Doodle | null {
  const matching = HAPPENINGS.filter((h) => covers(h, mmdd));
  if (matching.length === 0) return null;
  const short = matching.filter((h) => lengthInDays(h) <= 3);
  const pool = short.length ? short : matching;
  return pool[rotation % pool.length];
}

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

const ALL_DOODLES: Doodle[] = [...EVERYDAY, ...Object.values(FIXED), EASTER, ...HAPPENINGS];

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
  const dayOfYear = Math.round((today - Date.UTC(year, 0, 1)) / 86_400_000);

  const happening = happeningOn(key, dayOfYear);
  if (happening) return { ...happening, night };

  const eligible = EVERYDAY.filter((d) => !d.months || d.months.includes(month));
  const pick = eligible[dayOfYear % eligible.length];

  // The sunny scene becomes a moonlit one after dark.
  if (night && pick.id === 'sunny') {
    return { ...pick, caption: 'Goodnight from the Garden Route', night };
  }
  return { ...pick, night };
}
