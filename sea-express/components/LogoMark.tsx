import { useId } from 'react';

/**
 * The small Town Hub mark: a map pin holding a sun over the sea, on the
 * ocean gradient. Drawn as SVG so it stays sharp at header size, where the
 * illustrated logo (public/town-hub-logo.jpg) is too detailed to read. The
 * illustrated logo is still used where there's room for it.
 */
export default function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  const id = useId();
  const bg = `${id}-bg`;
  const pin = `${id}-pin`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Town Hub"
      className={className}
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a2f5c" />
          <stop offset="0.55" stopColor="#1c6cb8" />
          <stop offset="1" stopColor="#2fb2cf" />
        </linearGradient>
        <clipPath id={pin}>
          <circle cx="20" cy="16" r="7.2" />
        </clipPath>
      </defs>

      <rect width="40" height="40" rx="11" fill={`url(#${bg})`} />
      {/* Swell along the bottom edge. */}
      <path d="M0 33 Q5 30.5 10 33 T20 33 T30 33 T40 33 V40 H0 Z" fill="#fff" opacity="0.18" />

      {/* The pin, with a sun setting into the sea inside it. */}
      <path
        d="M20 5.5 C 13.9 5.5 9.5 10 9.5 15.8 C 9.5 22.6 17 29.4 19.2 31.2 A1.2 1.2 0 0 0 20.8 31.2 C 23 29.4 30.5 22.6 30.5 15.8 C 30.5 10 26.1 5.5 20 5.5 Z"
        fill="#fff"
      />
      <g clipPath={`url(#${pin})`}>
        <rect x="12" y="8" width="16" height="16" fill="#e0f2fe" />
        <circle cx="20" cy="17.6" r="3.6" fill="#f6b44b" />
        <path d="M12 18.6 Q14 17.4 16 18.6 T20 18.6 T24 18.6 T28 18.6 V24 H12 Z" fill="#1c8ec4" />
        <path d="M12 20.8 Q14 19.8 16 20.8 T20 20.8 T24 20.8 T28 20.8 V24 H12 Z" fill="#0a5c9c" />
      </g>
    </svg>
  );
}
