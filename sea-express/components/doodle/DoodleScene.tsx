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

const SKY: Record<ScenePhase, [string, string, string]> = {
  dawn: ['#c4b5fd', '#f9a8d4', '#fde68a'],
  day: ['#0ea5e9', '#7dd3fc', '#e0f2fe'],
  dusk: ['#6d28d9', '#f97316', '#fde68a'],
  night: ['#020617', '#1e1b4b', '#1e3a8a'],
};

const LAND: Record<ScenePhase, [string, string]> = {
  dawn: ['#7c8fa6', '#4b6b5a'],
  day: ['#6b9e83', '#3f7a52'],
  dusk: ['#7c4a6e', '#3f2a4f'],
  night: ['#1e293b', '#0f172a'],
};

const SEA: Record<ScenePhase, [string, string, string]> = {
  dawn: ['#0e7490', '#22d3ee', '#a5f3fc'],
  day: ['#0e7490', '#06b6d4', '#a5f3fc'],
  dusk: ['#155e75', '#0e7490', '#fdba74'],
  night: ['#0c2a4d', '#1e3a8a', '#60a5fa'],
};

/** A rolling band of sea: a wave with a 40px period, long enough to loop. */
function wavePath(y: number, amp: number) {
  let d = `M-40 ${y} q10 ${-amp} 20 0`;
  for (let i = 0; i < 19; i++) d += ' t20 0';
  return `${d} V170 H-40 Z`;
}

// Fixed pseudo-random spreads, so the scene looks the same on every render.
const STARS = [
  [18, 14], [44, 34], [70, 10], [96, 28], [182, 12], [206, 36], [232, 18],
  [258, 8], [284, 30], [304, 14], [12, 48], [150, 40], [272, 52], [60, 56],
];
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  x: (i * 47 + 13) % 316,
  delay: ((i * 37) % 23) / 10,
  duration: 2.4 + ((i * 13) % 10) / 6,
  rotate: (i * 53) % 180,
  wide: i % 3 === 0,
}));

/**
 * The large version of the daily doodle: today's picture rises like the sun
 * over the Outeniqua mountains and the sea, with the sky set to the time of
 * day. Holidays add bunting and confetti.
 */
export default function DoodleScene({ doodle, hour }: { doodle: Doodle; hour: number }) {
  const phase = scenePhase(hour);
  const ids = useId();
  const sky = `${ids}-sky`;
  const glow = `${ids}-glow`;
  const [skyTop, skyMid, skyLow] = SKY[phase];
  const [landBack, landFront] = LAND[phase];
  const [seaDeep, seaMid, seaFoam] = SEA[phase];
  const night = phase === 'night';

  return (
    <svg viewBox="0 0 320 170" className="block w-full" role="img" aria-label={doodle.caption}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="0.55" stopColor={skyMid} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#fff" stopOpacity={night ? 0.35 : 0.75} />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="170" fill={`url(#${sky})`} />

      {night &&
        STARS.map(([x, y], i) => (
          <circle
            key={i}
            className="doodle-part doodle-twinkle"
            style={{ animationDelay: `${(i % 5) * 0.3}s`, animationDuration: `${1.6 + (i % 4) * 0.5}s` }}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 1.4 : 0.9}
            fill="#fef9c3"
          />
        ))}

      {!night && (
        <g opacity="0.85">
          <g className="doodle-cloud">
            <ellipse cx="60" cy="30" rx="26" ry="8" fill="#fff" />
            <ellipse cx="74" cy="25" rx="14" ry="8" fill="#fff" />
          </g>
          <g className="doodle-cloud" style={{ animationDuration: '38s', animationDelay: '-12s' }}>
            <ellipse cx="250" cy="44" rx="22" ry="6.5" fill="#fff" />
            <ellipse cx="262" cy="40" rx="11" ry="6" fill="#fff" />
          </g>
        </g>
      )}

      {/* Today's picture, rising like the sun. */}
      <g className="doodle-rise">
        <circle cx="160" cy="60" r="46" fill={`url(#${glow})`} />
        <g transform="translate(128 28) scale(2.666)">{renderGlyph(doodle.glyph, night)}</g>
      </g>

      {doodle.accent === 'gull' &&
        [
          { y: 30, s: 1.3, dur: 16, delay: 0 },
          { y: 46, s: 1, dur: 21, delay: -7 },
          { y: 22, s: 0.8, dur: 26, delay: -15 },
        ].map((g, i) => (
          <g key={i} className="doodle-fly" style={{ animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}>
            <g transform={`translate(0 ${g.y}) scale(${g.s})`}>
              <AccentArt accent="gull" />
            </g>
          </g>
        ))}

      {doodle.accent === 'sparkles' &&
        [
          [30, 40, 1.3],
          [232, 22, 1.1],
          [270, 70, 0.9],
          [80, 78, 0.8],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <AccentArt accent="sparkles" />
          </g>
        ))}

      {/* Outeniqua mountains. */}
      <path
        d="M0 112 L28 86 L52 98 L84 70 L112 92 L138 78 L170 100 L204 74 L236 94 L262 80 L292 96 L320 84 V124 H0 Z"
        fill={landBack}
      />
      <path d="M0 120 L36 102 L70 114 L110 98 L150 116 L196 104 L240 118 L282 102 L320 112 V130 H0 Z" fill={landFront} />

      {/* The sea, three bands rolling at different speeds. */}
      <rect y="122" width="320" height="48" fill={seaDeep} />
      <path className="doodle-sea" style={{ animationDuration: '7s' }} d={wavePath(124, 3)} fill={seaMid} opacity="0.9" />
      <path
        className="doodle-sea"
        style={{ animationDuration: '5s', animationDirection: 'reverse' }}
        d={wavePath(140, 4)}
        fill={seaDeep}
        opacity="0.85"
      />
      <path className="doodle-sea" style={{ animationDuration: '3.6s' }} d={wavePath(156, 3)} fill={seaFoam} opacity="0.5" />

      {doodle.accent === 'whale' && (
        <g transform="translate(196 112)">
          <g className="doodle-part doodle-breach">
            <g transform="scale(2.3)">
              <AccentArt accent="whale" />
            </g>
          </g>
        </g>
      )}

      {doodle.accent === 'boat' && (
        <g className="doodle-sail">
          <g transform="translate(0 104) scale(1.7)">
            <AccentArt accent="boat" />
          </g>
        </g>
      )}

      {doodle.holiday && <Bunting colors={doodle.letters} />}

      {doodle.holiday &&
        CONFETTI.map((c, i) => (
          <rect
            key={i}
            className="doodle-confetti"
            style={{
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              transformOrigin: `${c.x + 2}px 0`,
            }}
            x={c.x}
            y={-10}
            width={c.wide ? 6 : 3.5}
            height={c.wide ? 3 : 6}
            rx="0.8"
            fill={doodle.letters[i % doodle.letters.length]}
            transform={`rotate(${c.rotate} ${c.x} -10)`}
          />
        ))}
    </svg>
  );
}

/** A string of flags across the top of the sky. */
function Bunting({ colors }: { colors: readonly string[] }) {
  const flags = Array.from({ length: 13 }, (_, i) => {
    const x = 8 + i * 24.5;
    // Follows the sag of the string: lowest in the middle.
    const t = x / 320;
    const y = 4 + 18 * 4 * t * (1 - t);
    return { x, y, color: colors[i % colors.length] };
  });
  return (
    <g>
      <path d="M0 4 Q160 40 320 4" fill="none" stroke="#475569" strokeWidth="1" />
      {flags.map((f, i) => (
        <path
          key={i}
          className="doodle-part doodle-swing"
          style={{ animationDelay: `${(i % 4) * 0.25}s`, animationDuration: '2.8s' }}
          d={`M${f.x - 7} ${f.y} L${f.x + 7} ${f.y} L${f.x} ${f.y + 15} Z`}
          fill={f.color}
        />
      ))}
    </g>
  );
}
