import { useId } from 'react';
import type { Doodle } from '@/lib/doodles';
import { AccentArt, renderGlyph } from './art';

export type ScenePhase = 'dawn' | 'day' | 'dusk' | 'night';

export function scenePhase(hour: number): ScenePhase {
  if (hour >= 19 || hour < 5) return 'night';
  if (hour < 7) return 'dawn';
  if (hour >= 17) return 'dusk';
  return 'day';
}

/**
 * A travel-poster palette for each time of day: sky top to horizon, the
 * sun (or moon) disc, four mountain layers from far to near, the sea, and
 * the two inks the day's emblem is printed in.
 */
interface Palette {
  sky: [string, string, string];
  disc: [string, string];
  hills: [string, string, string, string];
  sea: [string, string];
  shimmer: string;
  ink: string;
  paper: string;
}

const PALETTES: Record<ScenePhase, Palette> = {
  dawn: {
    sky: ['#a99cc4', '#e3b2a4', '#f6d9ae'],
    disc: ['#fbe0a4', '#ef9f7c'],
    hills: ['#c0aabb', '#9a88a3', '#6e6886', '#45445f'],
    sea: ['#4f6283', '#8292b0'],
    shimmer: '#f8e3c2',
    ink: '#3a2f4f',
    paper: '#fff4e2',
  },
  day: {
    sky: ['#8dbfd2', '#c9e0df', '#f2e4c8'],
    disc: ['#f8d08c', '#e88d5e'],
    hills: ['#b3c6c6', '#86a4a6', '#5b7f81', '#33575a'],
    sea: ['#2e6c78', '#5a95a0'],
    shimmer: '#eef5f1',
    ink: '#24363c',
    paper: '#fff7e8',
  },
  dusk: {
    sky: ['#3c3566', '#b75f6b', '#f2a56d'],
    disc: ['#ffd895', '#f07a4f'],
    hills: ['#93617b', '#6b4d6e', '#44395d', '#26213f'],
    sea: ['#2b2a53', '#5c4b76'],
    shimmer: '#ffd3a3',
    ink: '#2a1d3a',
    paper: '#fff0dc',
  },
  night: {
    sky: ['#070b1f', '#121b3c', '#26335f'],
    disc: ['#f6f1dc', '#d7cca4'],
    hills: ['#2b375e', '#1f2a4a', '#151d38', '#0b1127'],
    sea: ['#0c1530', '#1d2b56'],
    shimmer: '#d8e0f5',
    ink: '#1c2340',
    paper: '#fdf8e9',
  },
};

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * An SVG filter that prints artwork in three flat tones, like a linocut:
 * the darkest parts of the original take `ink`, the middle ones `mid` and
 * the lightest `paper`, so every emblem shares the poster's palette however
 * colourfully it was drawn.
 */
export function Linocut({ id, ink, mid, paper }: { id: string; ink: string; mid: string; paper: string }) {
  const [i, m, p] = [rgb(ink), rgb(mid), rgb(paper)];
  const channel = (k: 0 | 1 | 2) => `${i[k]} ${m[k]} ${p[k]}`;
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues={channel(0)} />
        <feFuncG type="discrete" tableValues={channel(1)} />
        <feFuncB type="discrete" tableValues={channel(2)} />
      </feComponentTransfer>
    </filter>
  );
}

/** Halfway between two colours. */
function mix(a: string, b: string): string {
  const [x, y] = [rgb(a), rgb(b)];
  const hex = (k: number) => Math.round(((x[k] + y[k]) / 2) * 255).toString(16).padStart(2, '0');
  return `#${hex(0)}${hex(1)}${hex(2)}`;
}

// Fixed pseudo-random spreads, so the scene looks the same on every render.
const STARS = [
  [18, 14], [44, 34], [70, 10], [96, 28], [182, 12], [206, 36], [232, 18],
  [258, 8], [284, 30], [304, 14], [12, 48], [150, 40], [272, 52], [60, 56],
  [222, 58], [300, 46], [130, 18], [168, 8],
];
const SPECKS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61 + 23) % 316,
  y: 10 + ((i * 37) % 70),
  delay: ((i * 29) % 20) / 10,
}));
const PETALS = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 47 + 13) % 316,
  delay: ((i * 37) % 23) / 10,
  duration: 4.5 + ((i * 13) % 10) / 4,
}));
// Flowers on the nearest hills: x, y on the ridge, colour.
const HILL_FLOWERS = [
  [14, 113, '#f0a85f'], [30, 109, '#f6e5c4'], [48, 108, '#e8834f'], [64, 110, '#f0a85f'],
  [88, 107, '#f6e5c4'], [104, 104, '#e8834f'], [126, 103, '#f0a85f'], [144, 106, '#f6e5c4'],
  [168, 108, '#e8834f'], [188, 109, '#f0a85f'], [210, 107, '#f6e5c4'], [230, 104, '#e8834f'],
  [252, 103, '#f0a85f'], [272, 105, '#f6e5c4'], [292, 106, '#e8834f'], [310, 104, '#f0a85f'],
] as const;

const SUN = { x: 112, y: 54, r: 34 };

/**
 * The large version of the daily doodle, drawn like a travel poster: the
 * day's emblem printed into the sun (or moon) as it rises over layered
 * Outeniqua mountains and the sea, in a palette for the time of day, with
 * a fine paper grain over it all.
 */
export default function DoodleScene({ doodle, hour }: { doodle: Doodle; hour: number }) {
  const phase = scenePhase(hour);
  const p = PALETTES[phase];
  const night = phase === 'night';
  const ids = useId();
  const sky = `${ids}-sky`;
  const disc = `${ids}-disc`;
  const glow = `${ids}-glow`;
  const sea = `${ids}-sea`;
  const haze = `${ids}-haze`;
  const duo = `${ids}-duo`;
  const silhouette = `${ids}-sil`;
  const grain = `${ids}-grain`;
  const discClip = `${ids}-clip`;

  return (
    <svg viewBox="0 0 320 170" className="block w-full" role="img" aria-label={doodle.caption}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.6" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={disc} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={p.disc[0]} />
          <stop offset="1" stopColor={p.disc[1]} />
        </radialGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor={p.disc[0]} stopOpacity={night ? 0.35 : 0.55} />
          <stop offset="1" stopColor={p.disc[0]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={sea} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sea[1]} />
          <stop offset="1" stopColor={p.sea[0]} />
        </linearGradient>
        <linearGradient id={haze} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[2]} stopOpacity="0" />
          <stop offset="1" stopColor={p.sky[2]} stopOpacity="0.55" />
        </linearGradient>
        <clipPath id={discClip}>
          <circle cx={SUN.x} cy={SUN.y} r={SUN.r - 2} />
        </clipPath>
        <Linocut id={duo} ink={p.ink} mid={mix(p.ink, p.disc[1])} paper={p.paper} />
        <filter id={silhouette}>
          <feFlood floodColor={p.hills[3]} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={grain} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0" />
        </filter>
      </defs>

      <rect width="320" height="170" fill={`url(#${sky})`} />

      {night &&
        STARS.map(([x, y], i) => (
          <circle
            key={i}
            className="doodle-part doodle-twinkle"
            style={{ animationDelay: `${(i % 5) * 0.4}s`, animationDuration: `${2.2 + (i % 4) * 0.6}s` }}
            cx={x}
            cy={y}
            r={i % 4 === 0 ? 1.1 : 0.6}
            fill="#fdf8e9"
          />
        ))}

      {/* Long, thin clouds, drifting slowly. */}
      {!night && (
        <g opacity={phase === 'day' ? 0.75 : 0.45} fill={p.paper}>
          <g className="doodle-cloud" style={{ animationDuration: '60s' }}>
            <rect x="150" y="30" width="96" height="3.2" rx="1.6" />
            <rect x="176" y="36" width="58" height="2.4" rx="1.2" />
          </g>
          <g className="doodle-cloud" style={{ animationDuration: '80s', animationDelay: '-30s' }}>
            <rect x="20" y="22" width="70" height="2.6" rx="1.3" />
            <rect x="34" y="27" width="40" height="2" rx="1" />
          </g>
        </g>
      )}

      {/* The sun (or moon) with today's emblem printed into it. */}
      <g className="doodle-rise">
        <circle className="doodle-part doodle-breathe" cx={SUN.x} cy={SUN.y} r={SUN.r + 30} fill={`url(#${glow})`} />
        {[SUN.r + 8, SUN.r + 15, SUN.r + 23].map((r, i) => (
          <circle
            key={r}
            cx={SUN.x}
            cy={SUN.y}
            r={r}
            fill="none"
            stroke={p.paper}
            strokeOpacity={0.35 - i * 0.1}
            strokeWidth="0.7"
          />
        ))}
        <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={`url(#${disc})`} />
        {[SUN.r - 2.5, SUN.r - 9, SUN.r - 17].map((r, i) => (
          <circle
            key={r}
            cx={SUN.x}
            cy={SUN.y}
            r={r}
            fill="none"
            stroke={i === 0 ? p.ink : p.paper}
            strokeOpacity={i === 0 ? 0.25 : 0.14}
            strokeWidth={i === 0 ? 0.6 : 2.4}
          />
        ))}
        <g clipPath={`url(#${discClip})`}>
          <g filter={`url(#${duo})`}>
            <g transform={`translate(${SUN.x - 22} ${SUN.y - 22}) scale(1.8333)`}>
              {renderGlyph(doodle.glyph, night, true)}
            </g>
          </g>
        </g>
      </g>

      {/* Birds as fine pen strokes. */}
      {doodle.accent === 'gull' &&
        [
          { y: 34, s: 0.9, dur: 22, delay: 0 },
          { y: 46, s: 0.7, dur: 28, delay: -9 },
          { y: 26, s: 0.55, dur: 34, delay: -18 },
        ].map((g, i) => (
          <g key={i} className="doodle-fly" style={{ animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
            <path
              className="doodle-part doodle-flap"
              style={{ animationDuration: '1.4s' }}
              transform={`translate(0 ${g.y}) scale(${g.s})`}
              d="M0 6 Q6 0 11 5 Q16 0 22 6"
              fill="none"
              stroke={p.ink}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        ))}

      {doodle.accent === 'sparkles' &&
        SPECKS.slice(0, 8).map((s, i) => (
          <circle
            key={i}
            className="doodle-part doodle-twinkle"
            style={{ animationDelay: `${s.delay}s`, animationDuration: '2.6s' }}
            cx={s.x}
            cy={s.y}
            r="0.9"
            fill={p.paper}
          />
        ))}

      {/* Outeniqua mountains, four layers fading into the haze. */}
      <path
        d="M0 92 C 36 74 64 82 96 72 C 128 62 160 78 192 68 C 226 58 258 74 290 64 C 304 60 314 62 320 64 V130 H0 Z"
        fill={p.hills[0]}
      />
      <path
        d="M0 101 C 30 90 62 96 92 86 C 126 76 152 94 186 88 C 220 82 250 96 284 86 C 300 82 312 84 320 86 V130 H0 Z"
        fill={p.hills[1]}
      />
      <rect y="70" width="320" height="60" fill={`url(#${haze})`} />
      <path
        d="M0 109 C 34 100 66 107 104 99 C 144 91 176 107 216 101 C 256 95 288 105 320 99 V132 H0 Z"
        fill={p.hills[2]}
      />
      <path
        d="M0 117 C 40 110 76 116 116 111 C 158 106 190 117 232 113 C 270 109 298 115 320 112 V132 H0 Z"
        fill={p.hills[3]}
      />

      {doodle.accent === 'flowers' &&
        HILL_FLOWERS.map(([x, y, c], i) => (
          <circle
            key={i}
            className="doodle-part doodle-pulse"
            style={{ animationDelay: `${(i % 6) * 0.4}s`, animationDuration: `${3 + (i % 3) * 0.6}s` }}
            cx={x}
            cy={y + 6}
            r="1.4"
            fill={c}
          />
        ))}

      {/* The sea, with a shimmering path of light under the sun. */}
      <rect y="122" width="320" height="48" fill={`url(#${sea})`} />
      <g opacity="0.85">
        {[127, 133, 140, 148, 157, 166].map((y, i) => {
          const w = 14 + i * 9;
          return (
            <rect
              key={y}
              className="doodle-part doodle-twinkle"
              style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${2.4 + (i % 3) * 0.5}s` }}
              x={SUN.x - w / 2}
              y={y}
              width={w}
              height="1.4"
              rx="0.7"
              fill={p.shimmer}
              opacity={0.7 - i * 0.08}
            />
          );
        })}
      </g>
      <g className="doodle-sea" style={{ animationDuration: '14s' }} stroke={p.shimmer} strokeOpacity="0.28" strokeWidth="0.8">
        {[
          [-30, 130, 40], [40, 136, 26], [190, 131, 34], [250, 144, 30], [-10, 152, 22],
          [150, 158, 28], [280, 160, 24], [70, 164, 30], [210, 166, 20],
        ].map(([x, y, w], i) => (
          <path key={i} d={`M${x} ${y} h${w}`} strokeLinecap="round" />
        ))}
      </g>

      {/* A shoal of sardines catching the light under the surface. */}
      {doodle.accent === 'shoal' &&
        [0, 1, 2].map((row) => (
          <g
            key={row}
            className="doodle-sail"
            style={{ animationDuration: `${12 + row * 4}s`, animationDelay: `${-row * 5}s`, animationDirection: 'reverse' }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <path
                key={i}
                transform={`translate(${i * 11 + (row % 2) * 5} ${138 + row * 8 + (i % 2) * 2.5}) scale(0.7)`}
                d="M0 0 Q5 -3 10 0 Q5 3 0 0 Z M10 0 L13 -2.2 L13 2.2 Z"
                fill={p.shimmer}
                opacity="0.55"
              />
            ))}
          </g>
        ))}

      {doodle.accent === 'whale' && (
        <g transform="translate(160 116)" filter={`url(#${silhouette})`}>
          <g className="doodle-part doodle-breach">
            <g transform="scale(2.1)">
              <AccentArt accent="whale" />
            </g>
          </g>
        </g>
      )}

      {doodle.accent === 'boat' && (
        <g className="doodle-sail" style={{ animationDuration: '40s' }}>
          <g transform="translate(0 106) scale(1.4)" filter={`url(#${silhouette})`}>
            <AccentArt accent="boat" />
          </g>
        </g>
      )}

      {/* Foreground: a headland with a lighthouse (after Cape St Blaize in
          Mossel Bay), and fynbos at the water's edge. */}
      <Headland p={p} night={night} />
      <Fynbos color={p.hills[3]} />

      {doodle.accent === 'petals' &&
        PETALS.map((c, i) => (
          <ellipse
            key={i}
            className="doodle-confetti"
            style={{ animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s`, transformOrigin: `${c.x}px 0` }}
            cx={c.x}
            cy={-8}
            rx="2.6"
            ry="1.4"
            fill={i % 3 === 0 ? '#d9cbef' : i % 3 === 1 ? '#b9a3e3' : '#9b82d4'}
            opacity="0.85"
          />
        ))}

      {doodle.holiday && <Bunting colors={doodle.letters} ink={p.ink} />}

      {doodle.holiday &&
        SPECKS.map((s, i) => (
          <path
            key={i}
            className="doodle-part doodle-twinkle"
            style={{ animationDelay: `${s.delay}s`, animationDuration: '2.2s' }}
            d={`M${s.x} ${s.y - 2.4} L${s.x + 0.7} ${s.y - 0.7} L${s.x + 2.4} ${s.y} L${s.x + 0.7} ${s.y + 0.7} L${s.x} ${s.y + 2.4} L${s.x - 0.7} ${s.y + 0.7} L${s.x - 2.4} ${s.y} L${s.x - 0.7} ${s.y - 0.7} Z`}
            fill={i % 2 ? '#f6d48a' : p.paper}
          />
        ))}

      {/* Paper grain over the whole print. */}
      <rect width="320" height="170" filter={`url(#${grain})`} />
    </svg>
  );
}

/** A cliff rising from the sea on the right, topped by a lighthouse whose beam sweeps the dark. */
function Headland({ p, night }: { p: Palette; night: boolean }) {
  const lamp = { x: 284, y: 82 };
  return (
    <g>
      {night && (
        <g transform={`translate(${lamp.x} ${lamp.y})`}>
          <g className="doodle-sweep">
            <path d="M0 0 L-150 -24 L-150 16 Z" fill={p.disc[0]} opacity="0.16" />
            <path d="M0 0 L-110 -10 L-110 8 Z" fill={p.disc[0]} opacity="0.18" />
          </g>
        </g>
      )}
      <path
        d="M246 170 L246 132 C 252 120 258 112 266 108 C 274 103 282 102 292 101 C 304 100 314 103 320 105 V170 Z"
        fill={p.hills[3]}
      />
      <path d="M246 132 C 252 120 258 112 266 108" fill="none" stroke={p.shimmer} strokeOpacity="0.25" strokeWidth="0.8" />
      {/* Keeper's cottage and tower. */}
      <path d="M296 101 V95 L301 91 L306 95 V101 Z" fill={p.ink} />
      <path d="M280.5 101 L282 86 H286 L287.5 101 Z" fill={night ? p.ink : p.paper} />
      <path d="M281.4 94 H286.6 M281 98 H287" stroke={night ? p.paper : p.ink} strokeOpacity="0.5" strokeWidth="1.1" />
      <rect x="281.2" y="83" width="5.6" height="3.4" rx="0.6" fill={night ? p.disc[0] : p.ink} />
      <path d="M280.6 83 L284 79.6 L287.4 83 Z" fill={p.ink} />
      {night && <circle className="doodle-part doodle-pulse" style={{ animationDuration: '3s' }} cx={lamp.x} cy={lamp.y + 2.6} r="3" fill={p.disc[0]} opacity="0.5" />}
    </g>
  );
}

/** Restios and a protea silhouetted at the water's edge, bottom left. */
function Fynbos({ color }: { color: string }) {
  const blades = [
    [6, 170, -6, 138], [12, 170, 4, 132], [18, 170, 20, 140], [24, 170, 14, 128], [30, 170, 34, 144],
    [36, 170, 30, 134], [44, 170, 52, 146], [50, 170, 46, 138], [58, 170, 66, 150], [64, 170, 60, 146],
  ];
  return (
    <g>
      <path d="M0 170 L0 156 C 20 150 46 152 74 162 L80 170 Z" fill={color} />
      {blades.map(([x1, y1, x2, y2], i) => (
        <path
          key={i}
          d={`M${x1} ${y1} Q${(x1 + x2) / 2 + 3} ${(y1 + y2) / 2} ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth={i % 2 ? 1.2 : 1.6}
          strokeLinecap="round"
        />
      ))}
      {/* A king protea on its stem. */}
      <path d="M40 170 Q41 156 39 146" fill="none" stroke={color} strokeWidth="1.6" />
      <g transform="translate(39 141)">
        {Array.from({ length: 9 }, (_, i) => (
          <ellipse key={i} cx="0" cy="-4.4" rx="1.6" ry="4.4" fill={color} transform={`rotate(${-80 + i * 20})`} />
        ))}
        <circle r="3.2" fill={color} />
      </g>
    </g>
  );
}

/** A fine string of pennants across the top of the sky. */
function Bunting({ colors, ink }: { colors: readonly string[]; ink: string }) {
  const flags = Array.from({ length: 15 }, (_, i) => {
    const x = 6 + i * 21.8;
    // Follows the sag of the string: lowest in the middle.
    const t = x / 320;
    const y = 3 + 14 * 4 * t * (1 - t);
    return { x, y, color: colors[i % colors.length] };
  });
  return (
    <g>
      <path d="M0 3 Q160 31 320 3" fill="none" stroke={ink} strokeOpacity="0.5" strokeWidth="0.6" />
      {flags.map((f, i) => (
        <path
          key={i}
          className="doodle-part doodle-swing"
          style={{ animationDelay: `${(i % 4) * 0.25}s`, animationDuration: '3.2s' }}
          d={`M${f.x - 4.5} ${f.y} L${f.x + 4.5} ${f.y} L${f.x} ${f.y + 10} Z`}
          fill={f.color}
          opacity="0.9"
        />
      ))}
    </g>
  );
}
