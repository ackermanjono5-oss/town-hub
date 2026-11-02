// Artwork for the daily doodle (lib/doodles.ts), shared by the small
// wordmark in the header and the large scene card. Every piece is drawn in a
// fixed viewBox: glyphs in 24x24, accents in 28x20.

import { useId } from 'react';
import type { DoodleAccent, DoodleGlyph } from '@/lib/doodles';

export function renderGlyph(glyph: DoodleGlyph, night: boolean) {
  switch (glyph) {
    case 'sun':
      return night ? <Moon /> : <Sun />;
    case 'wave':
      return <WaveBubble />;
    case 'lifebuoy':
      return (
        <g className="doodle-part doodle-spin">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="#fff" strokeWidth="5" />
          <circle
            cx="12"
            cy="12"
            r="8.5"
            fill="none"
            stroke="#dc2626"
            strokeWidth="5"
            strokeDasharray="6.68 6.68"
          />
          <circle cx="12" cy="12" r="11" fill="none" stroke="#b91c1c" strokeWidth="0.8" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#b91c1c" strokeWidth="0.8" />
        </g>
      );
    case 'protea':
      return (
        <g className="doodle-part doodle-pulse" style={{ animationDuration: '3s' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <ellipse
              key={i}
              cx="12"
              cy="4.5"
              rx="2.6"
              ry="5"
              fill={i % 2 ? '#f472b6' : '#db2777'}
              transform={`rotate(${i * 36} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="4.6" fill="#fde68a" />
          <circle cx="12" cy="12" r="4.6" fill="none" stroke="#be185d" strokeWidth="1" strokeDasharray="1 1.2" />
        </g>
      );
    case 'compass':
      return (
        <>
          <circle cx="12" cy="12" r="10.5" fill="#ecfeff" stroke="#0f766e" strokeWidth="2.2" />
          <g className="doodle-part doodle-needle">
            <path d="M12 3.5 L14.2 12 L9.8 12 Z" fill="#dc2626" />
            <path d="M12 20.5 L14.2 12 L9.8 12 Z" fill="#334155" />
          </g>
          <circle cx="12" cy="12" r="1.4" fill="#0f766e" />
        </>
      );
    case 'beachball':
      return (
        <g className="doodle-part doodle-spin-fast">
          <circle cx="12" cy="12" r="10.5" fill="#fff" />
          {['#ef4444', '#f59e0b', '#0ea5e9'].map((c, i) => (
            <path
              key={c}
              d="M12 12 L12 1.5 A10.5 10.5 0 0 1 21.1 6.75 Z"
              fill={c}
              transform={`rotate(${i * 120} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="10.5" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.35" />
          <circle cx="12" cy="12" r="2" fill="#fff" />
        </g>
      );
    case 'heart':
      return (
        <path
          className="doodle-part doodle-pulse"
          d="M12 21 C 4 15.5 1.5 11.5 1.5 7.8 A5 5 0 0 1 12 5.6 A5 5 0 0 1 22.5 7.8 C 22.5 11.5 20 15.5 12 21 Z"
          fill="#e11d48"
        />
      );
    case 'flag':
      return <FlagRing />;
    case 'gear':
      return (
        <g className="doodle-part doodle-spin">
          <circle cx="12" cy="12" r="8.6" fill="none" stroke="#b45309" strokeWidth="4.4" strokeDasharray="3.4 3.35" />
          <circle cx="12" cy="12" r="7" fill="#f59e0b" />
          <circle cx="12" cy="12" r="2.6" fill="#fff" />
        </g>
      );
    case 'flame':
      return (
        <>
          <rect x="3" y="20" width="18" height="3" rx="1.5" fill="#57534e" />
          <path
            className="doodle-part doodle-flicker"
            d="M12 1.5 C 16 6 19 9.5 19 14 A7 7 0 0 1 5 14 C 5 10.5 7.5 8.5 8.5 6 C 9.5 8 10.5 8.5 11 9 C 11 6 11.3 4 12 1.5 Z"
            fill="#f97316"
          />
          <path
            className="doodle-part doodle-flicker"
            style={{ animationDelay: '0.3s' }}
            d="M12 9 C 14.5 11.5 15.5 13 15.5 15 A3.5 3.5 0 0 1 8.5 15 C 8.5 13 10 11.5 12 9 Z"
            fill="#fde047"
          />
        </>
      );
    case 'firework':
      return (
        <>
          <g className="doodle-part doodle-burst">
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1="12"
                y1="5"
                x2="12"
                y2="1"
                stroke={['#7c3aed', '#db2777', '#f59e0b', '#0891b2'][i % 4]}
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${i * 30} 12 12)`}
              />
            ))}
          </g>
          <circle className="doodle-part doodle-twinkle" cx="12" cy="12" r="3" fill="#f59e0b" />
        </>
      );
    case 'bauble':
      return (
        <g className="doodle-part doodle-swing">
          <rect x="10" y="0.5" width="4" height="3.5" rx="0.8" fill="#ca8a04" />
          <circle cx="12" cy="14" r="9.5" fill="#dc2626" />
          <path d="M3.2 12.5 Q12 16.5 20.8 12.5" fill="none" stroke="#fde047" strokeWidth="1.6" />
          <circle cx="8.5" cy="10" r="2" fill="#fff" opacity="0.55" />
        </g>
      );
    case 'egg':
      return (
        <g className="doodle-part doodle-wobble">
          <ellipse cx="12" cy="13" rx="8.5" ry="10.5" fill="#c4b5fd" />
          <path d="M3.8 11 L7 8.5 L10 11 L13 8.5 L16 11 L19 8.5 L20.3 9.6" fill="none" stroke="#db2777" strokeWidth="1.6" />
          <path d="M3.6 16 L7 18.5 L10 16 L13 18.5 L16 16 L19 18.5 L20.4 17.4" fill="none" stroke="#16a34a" strokeWidth="1.6" />
          <circle cx="12" cy="13.5" r="1.5" fill="#f59e0b" />
        </g>
      );
    case 'gradcap':
      return (
        <>
          <g className="doodle-part doodle-bob">
            <path d="M6 11.5 V16.5 C6 19.2 18 19.2 18 16.5 V11.5 L12 14.4 Z" fill="#334155" />
            <path d="M12 4 L23.5 9.2 L12 14.4 L0.5 9.2 Z" fill="#0f172a" />
            <path d="M12 4 L23.5 9.2 L12 14.4 L0.5 9.2 Z" fill="none" stroke="#475569" strokeWidth="0.6" />
          </g>
          <g className="doodle-part doodle-swing">
            <path d="M12 9.2 L20 10.6 L20 17" fill="none" stroke="#f59e0b" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M18.8 17 H21.2 L21.6 20.5 H18.4 Z" fill="#f59e0b" />
          </g>
          <circle cx="12" cy="9.2" r="0.9" fill="#f59e0b" />
        </>
      );
    case 'jacaranda':
      return (
        <>
          <path d="M12 23 V14 M12 16.5 L8.2 12.5 M12 15.5 L15.8 11.8" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          <g className="doodle-part doodle-pulse" style={{ animationDuration: '3.4s' }}>
            {[
              [7, 9.5, 4.6, '#a78bfa'],
              [12, 6, 5.2, '#8b5cf6'],
              [17, 9.5, 4.6, '#a78bfa'],
              [9.2, 12.8, 3.8, '#c4b5fd'],
              [14.8, 12.8, 3.8, '#7c3aed'],
              [12, 10, 3.6, '#c4b5fd'],
            ].map(([x, y, r, c], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={c as string} />
            ))}
          </g>
        </>
      );
    case 'sardines':
      return <Sardines />;
    case 'oyster':
      return (
        <>
          <path d="M1 13 Q12 28 23 13 Z" fill="#78716c" />
          <path d="M3 14 Q12 24 21 14" fill="none" stroke="#a8a29e" strokeWidth="0.8" />
          <path d="M1 12.5 Q12 -5 23 12.5 Z" fill="#d6d3d1" />
          <path d="M1 12.5 Q12 -5 23 12.5" fill="none" stroke="#a8a29e" strokeWidth="0.8" />
          {[5, 8.5, 12, 15.5, 19].map((x) => (
            <path key={x} d={`M12 12.5 L${x} ${x === 12 ? 4 : 4.8 + Math.abs(12 - x) * 0.75}`} stroke="#a8a29e" strokeWidth="0.7" />
          ))}
          <circle className="doodle-part doodle-pulse" style={{ animationDuration: '2.4s' }} cx="12" cy="15.4" r="3.9" fill="#f8fafc" />
          <circle cx="10.7" cy="14.1" r="1.1" fill="#fff" />
          <circle cx="12" cy="15.4" r="3.9" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
        </>
      );
    case 'car':
      return (
        <>
          <g className="doodle-part doodle-bob" style={{ animationDuration: '1.4s' }}>
            <path d="M1.5 16 Q1.5 11.6 5.6 11.4 L8.2 6.8 H15.2 L18.4 11.4 H20 Q22.5 11.6 22.5 14.6 V16.4 H1.5 Z" fill="#dc2626" />
            <path d="M9 8 H11.6 V11.2 H7.3 Z M12.8 8 H14.6 L16.8 11.2 H12.8 Z" fill="#bae6fd" />
            <rect x="20.6" y="12.4" width="1.6" height="1.4" rx="0.4" fill="#fde047" />
            <path d="M1.5 14.4 H22.5" stroke="#991b1b" strokeWidth="0.6" />
          </g>
          <Wheel cx={6.8} />
          <Wheel cx={17.2} />
        </>
      );
    case 'tree':
      return (
        <>
          <path d="M12 23 V13" stroke="#78350f" strokeWidth="2.6" strokeLinecap="round" />
          <g className="doodle-part doodle-wobble" style={{ animationDuration: '3s' }}>
            <circle cx="12" cy="9" r="7.5" fill="#16a34a" />
            <circle cx="8.5" cy="11.5" r="4.4" fill="#15803d" />
            <circle cx="15.8" cy="11" r="4.2" fill="#22c55e" />
            <circle cx="10" cy="6.2" r="1.6" fill="#86efac" opacity="0.8" />
          </g>
        </>
      );
    case 'drop':
      return (
        <g className="doodle-part doodle-bob">
          <path d="M12 1.5 C 12 1.5 4 10.5 4 15.2 A8 8 0 0 0 20 15.2 C 20 10.5 12 1.5 12 1.5 Z" fill="#38bdf8" />
          <path d="M12 1.5 C 12 1.5 4 10.5 4 15.2 A8 8 0 0 0 20 15.2 C 20 10.5 12 1.5 12 1.5 Z" fill="none" stroke="#0284c7" strokeWidth="1.2" />
          <ellipse cx="8.8" cy="14" rx="1.6" ry="3" fill="#fff" opacity="0.7" transform="rotate(20 8.8 14)" />
        </g>
      );
    case 'masks':
      return (
        <>
          <g className="doodle-part doodle-bob" style={{ animationDelay: '0.4s' }}>
            <path d="M10 4 Q16 2 22 4 V10.5 Q22 17 16 18 Q10 17 10 10.5 Z" fill="#7c3aed" transform="rotate(12 16 10)" />
            <g transform="rotate(12 16 10)">
              <path d="M12.6 8.6 Q13.8 7.6 15 8.6 M17 8.6 Q18.2 7.6 19.4 8.6" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
              <path d="M13.6 14.6 Q16 12.6 18.4 14.6" fill="none" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </g>
          <g className="doodle-part doodle-bob">
            <path d="M2 5 Q8 3 14 5 V11.5 Q14 18 8 19 Q2 18 2 11.5 Z" fill="#f59e0b" transform="rotate(-12 8 11)" />
            <g transform="rotate(-12 8 11)">
              <path d="M4.6 9.6 Q5.8 8.4 7 9.6 M9 9.6 Q10.2 8.4 11.4 9.6" fill="none" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
              <path d="M5.4 13 Q8 15.8 10.6 13" fill="none" stroke="#7c2d12" strokeWidth="1.1" strokeLinecap="round" />
            </g>
          </g>
        </>
      );
    case 'ribbon':
    case 'ribbon-purple':
      return (
        <path
          className="doodle-part doodle-pulse"
          style={{ animationDuration: '2.8s' }}
          fillRule="evenodd"
          d="M12 2 C 7.6 2 6.6 6.6 8.8 10 L3.6 21 L7.4 22.2 L12 12.8 L16.6 22.2 L20.4 21 L15.2 10 C 17.4 6.6 16.4 2 12 2 Z M12 5.2 C 13.9 5.2 14.2 7.2 13.1 8.8 L12 10.4 L10.9 8.8 C 9.8 7.2 10.1 5.2 12 5.2 Z"
          fill={glyph === 'ribbon' ? '#dc2626' : '#7c3aed'}
        />
      );
    case 'daisy':
      return (
        <g className="doodle-part doodle-pulse" style={{ animationDuration: '3.2s' }}>
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse
              key={i}
              cx="12"
              cy="4.2"
              rx="1.8"
              ry="4.6"
              fill={i % 2 ? '#fb923c' : '#f97316'}
              transform={`rotate(${i * (360 / 14)} 12 12)`}
            />
          ))}
          <circle cx="12" cy="12" r="4" fill="#422006" />
          <circle cx="12" cy="12" r="4" fill="none" stroke="#facc15" strokeWidth="0.9" strokeDasharray="0.8 1" />
        </g>
      );
    case 'pencil':
      return (
        <g className="doodle-part doodle-wobble" style={{ animationDuration: '2.2s' }}>
          <g transform="rotate(-40 12 12)">
            <rect x="9" y="2" width="6" height="15" fill="#facc15" />
            <rect x="9" y="2" width="2" height="15" fill="#fde047" />
            <rect x="9" y="1" width="6" height="2.6" rx="0.6" fill="#f472b6" />
            <rect x="9" y="3.2" width="6" height="1.3" fill="#94a3b8" />
            <path d="M9 17 L12 22.5 L15 17 Z" fill="#fde68a" />
            <path d="M11 20.6 L12 22.5 L13 20.6 Z" fill="#1e293b" />
          </g>
        </g>
      );
  }
}

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="doodle-part doodle-spin-fast">
      <circle cx={cx} cy="16.6" r="3.1" fill="#1e293b" />
      <circle cx={cx} cy="16.6" r="1.5" fill="#e2e8f0" />
      <path d={`M${cx - 2.6} 16.6 H${cx + 2.6} M${cx} 14 V19.2`} stroke="#e2e8f0" strokeWidth="0.6" />
    </g>
  );
}

/** A porthole with a shoal of sardines darting past. */
function Sardines() {
  const clip = useId();
  const fish = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q5 -3.6 10 0 Q5 3.6 0 0 Z" fill="#cbd5e1" />
      <path d="M0 0 Q5 -3.6 10 0" fill="none" stroke="#475569" strokeWidth="0.7" />
      <path d="M10 0 L13.5 -2.6 L13.5 2.6 Z" fill="#94a3b8" />
      <circle cx="2.2" cy="-0.4" r="0.6" fill="#0f172a" />
    </g>
  );
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="10.5" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="#0369a1" />
      <g clipPath={`url(#${clip})`}>
        <g className="doodle-wave" style={{ animationDuration: '1.8s' }}>
          {fish(4, 8, 0.9)}
          {fish(16, 8, 0.9)}
          {fish(-2, 13, 0.9)}
          {fish(10, 13, 0.9)}
          {fish(22, 13, 0.9)}
          {fish(4, 18, 0.9)}
          {fish(16, 18, 0.9)}
        </g>
      </g>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="#0c4a6e" strokeWidth="2" />
    </>
  );
}

function Sun() {
  return (
    <>
      <g className="doodle-part doodle-spin">
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1="12"
            y1="1"
            x2="12"
            y2="4"
            stroke="#f59e0b"
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </g>
      <circle cx="12" cy="12" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.2" />
    </>
  );
}

function Moon() {
  return (
    <>
      <path d="M15.5 2.5 A10 10 0 1 0 21.5 17 A8 8 0 0 1 15.5 2.5 Z" fill="#fcd34d" />
      <path
        className="doodle-part doodle-twinkle"
        d="M20 3 L20.8 5.2 L23 6 L20.8 6.8 L20 9 L19.2 6.8 L17 6 L19.2 5.2 Z"
        fill="#fde68a"
      />
    </>
  );
}

/** A round porthole of sea with waves rolling across it. */
function WaveBubble() {
  const clip = useId();
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="10.5" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="#e0f2fe" />
      <g clipPath={`url(#${clip})`}>
        <path
          className="doodle-wave"
          d="M-12 12 q3 -3 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 V24 H-12 Z"
          fill="#22d3ee"
        />
        <path
          className="doodle-wave"
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          d="M-12 16 q3 -2.5 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 V24 H-12 Z"
          fill="#0e7490"
        />
      </g>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="#0e7490" strokeWidth="2" />
    </>
  );
}

/** The South African flag, cropped to a circle. */
function FlagRing() {
  const clip = useId();
  return (
    <>
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="10.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="0" width="24" height="12" fill="#E03C31" />
        <rect x="0" y="12" width="24" height="12" fill="#001489" />
        <path d="M-1 0 L10 12 L-1 24 M10 12 H25" fill="none" stroke="#fff" strokeWidth="8" />
        <path d="M-1 0 L10 12 L-1 24 M10 12 H25" fill="none" stroke="#007749" strokeWidth="4.6" />
        <path d="M0 4 L7.5 12 L0 20 Z" fill="#000" stroke="#FFB81C" strokeWidth="1.6" />
      </g>
      <circle className="doodle-part doodle-pulse" style={{ animationDuration: '2.6s' }} cx="12" cy="12" r="10.5" fill="none" stroke="#FFB81C" strokeWidth="1.4" />
    </>
  );
}

/** Accent artwork in a 28x20 box. */
export function AccentArt({ accent }: { accent: DoodleAccent }) {
  return (
    <>
      {accent === 'whale' && (
        <>
          <g className="doodle-part doodle-bob">
            <path
              d="M3 13 C 4 8 10 6.5 15 8 C 19 9 21 11 22.5 10 L25.5 7 L25 11.5 L27.5 14 L23.5 13.5 C 21 16.5 15 17.5 9 16.5 C 5.5 16 3 15 3 13 Z"
              fill="#0c4a6e"
            />
            <path d="M5 14 C 9 15.5 15 15.6 20 14" fill="none" stroke="#7dd3fc" strokeWidth="1.1" />
            <circle cx="7" cy="11.4" r="0.9" fill="#fff" />
          </g>
          <g className="doodle-part doodle-spout">
            <path d="M9 5 Q8 2 6 1.5 M9 5 Q9 1.5 9.5 0.5 M9 5 Q10.5 2 12.5 1.5" fill="none" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        </>
      )}
      {accent === 'boat' && (
        <>
          <g className="doodle-part doodle-bob">
            <path d="M13 1.5 L13 13 L5 13 Z" fill="#fff" stroke="#0e7490" strokeWidth="1.1" strokeLinejoin="round" />
            <path d="M14.5 4 L14.5 13 L21 13 Z" fill="#f59e0b" />
            <path d="M3.5 14 H23.5 L20.5 17.5 H6.5 Z" fill="#b45309" />
          </g>
          <path className="doodle-wave" d="M-12 19 q3 -1.6 6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0 t6 0" fill="none" stroke="#22d3ee" strokeWidth="1.3" style={{ animationDuration: '1.6s' }} />
        </>
      )}
      {accent === 'gull' && (
        <>
          <path className="doodle-part doodle-flap" d="M3 10 Q7 5 10.5 9.5 Q14 5 18 10" fill="none" stroke="#334155" strokeWidth="1.7" strokeLinecap="round" />
          <path className="doodle-part doodle-flap" style={{ animationDelay: '0.35s' }} d="M15 5 Q17.5 2 20 4.8 Q22.5 2 25 5" fill="none" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
      {accent === 'shoal' && (
        <g className="doodle-part doodle-bob" style={{ animationDuration: '1.6s' }}>
          {[
            [3, 7],
            [12, 11],
            [18, 5],
            [7, 15],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d="M0 0 Q3 -2.2 6 0 Q3 2.2 0 0 Z" fill="#94a3b8" />
              <path d="M6 0 L8.2 -1.6 L8.2 1.6 Z" fill="#64748b" />
            </g>
          ))}
        </g>
      )}
      {accent === 'petals' && (
        <>
          {[
            [6, 5, 0],
            [14, 12, 0.5],
            [21, 4, 1],
            [24, 14, 1.4],
          ].map(([x, y, delay], i) => (
            <ellipse
              key={i}
              className="doodle-part doodle-twinkle"
              style={{ animationDelay: `${delay}s` }}
              cx={x}
              cy={y}
              rx="2.2"
              ry="1.3"
              fill={i % 2 ? '#a78bfa' : '#8b5cf6'}
              transform={`rotate(${i * 40} ${x} ${y})`}
            />
          ))}
        </>
      )}
      {accent === 'flowers' && (
        <>
          {[
            [6, 0, '#f97316'],
            [14, 0.4, '#facc15'],
            [22, 0.8, '#fb923c'],
          ].map(([x, delay, c], i) => (
            <g key={i} className="doodle-part doodle-wobble" style={{ animationDelay: `${delay}s` }}>
              <path d={`M${x} 19 V12`} stroke="#15803d" strokeWidth="1.2" />
              {Array.from({ length: 6 }, (_, k) => (
                <ellipse key={k} cx={x as number} cy={8.6} rx="1.1" ry="2.2" fill={c as string} transform={`rotate(${k * 60} ${x} 11)`} />
              ))}
              <circle cx={x as number} cy="11" r="1.3" fill="#422006" />
            </g>
          ))}
        </>
      )}
      {accent === 'sparkles' && (
        <>
          <path className="doodle-part doodle-twinkle" d="M8 4 L9.2 8 L13 9.2 L9.2 10.4 L8 14.5 L6.8 10.4 L3 9.2 L6.8 8 Z" fill="#f59e0b" />
          <path className="doodle-part doodle-twinkle" style={{ animationDelay: '0.5s' }} d="M19 1 L19.8 3.6 L22.4 4.4 L19.8 5.2 L19 7.8 L18.2 5.2 L15.6 4.4 L18.2 3.6 Z" fill="#ec4899" />
          <path className="doodle-part doodle-twinkle" style={{ animationDelay: '1s' }} d="M21 11 L21.7 13.3 L24 14 L21.7 14.7 L21 17 L20.3 14.7 L18 14 L20.3 13.3 Z" fill="#0ea5e9" />
        </>
      )}
    </>
  );
}
