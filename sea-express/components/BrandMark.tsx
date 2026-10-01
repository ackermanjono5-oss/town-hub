import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';

/**
 * The identity tile on a directory card.
 *
 * Most Garden Route listings are independent local businesses with no web
 * presence at all, so no real logo exists to show — the monogram is what the
 * majority of cards actually display, which is why it is designed rather than
 * left as a plain placeholder. Every visual choice is a pure function of the
 * business name, so a given listing always looks identical, and the grid reads
 * as a set of distinct marks instead of repeating wallpaper.
 *
 * Four things vary per listing: the colour pair, the gradient direction, the
 * decorative motif, and the initials. Combined, that is 12 x 4 x 4 = 192
 * distinct looks before the letters are even considered.
 *
 * A monogram is explicitly NOT presented as the business's logo — it carries
 * no brand claim, just initials. The category glyph behind it is a watermark,
 * never the brand's own symbol.
 */

// Full class strings, because Tailwind only keeps classes it can see as
// literals — a template like `from-${name}-400` would be purged.
const MONOGRAM_COLORS = [
  'from-rose-400 to-rose-600',
  'from-orange-400 to-orange-600',
  'from-amber-400 to-amber-600',
  'from-lime-500 to-lime-700',
  'from-emerald-400 to-emerald-600',
  'from-teal-400 to-teal-600',
  'from-cyan-500 to-cyan-700',
  'from-sky-500 to-sky-700',
  'from-indigo-400 to-indigo-600',
  'from-violet-400 to-violet-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-slate-500 to-slate-700',
];

/** Direction varies too, so neighbouring cards in the same hue differ. */
const GRADIENT_DIRECTIONS = [
  'bg-gradient-to-br',
  'bg-gradient-to-tr',
  'bg-gradient-to-r',
  'bg-gradient-to-b',
];

/**
 * A faint geometric motif over the gradient. CSS gradients rather than image
 * files, so this costs no bytes in the bundle and stays crisp at any size.
 */
const MOTIFS = [
  // Soft corner highlight.
  'radial-gradient(circle at 22% 18%, rgba(255,255,255,0.38), transparent 58%)',
  // Fine diagonal pinstripe.
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0 2px, transparent 2px 9px)',
  // Scattered dots.
  'radial-gradient(circle at 18% 28%, rgba(255,255,255,0.28) 12%, transparent 13%), radial-gradient(circle at 72% 62%, rgba(255,255,255,0.22) 9%, transparent 10%)',
  // Wide sweep, like a brand swoosh.
  'linear-gradient(105deg, rgba(255,255,255,0.22) 0 38%, transparent 38%)',
];

/** djb2 — small, stable, and good enough to spread names across the palette. */
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Up to two initials. Leading articles and "The" are skipped so "The Bike
 * Shop" reads as BS rather than TB.
 */
export function getInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s&]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !/^(the|a|an|at|of|and|&)$/i.test(w));
  const source = words.length > 0 ? words : name.split(/\s+/).filter(Boolean);
  if (source.length === 0) return '?';
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return (source[0][0] + source[1][0]).toUpperCase();
}

/**
 * `tile` is the compact square used beside a name. `banner` is the full-width
 * panel the cards use, which gives a wide wordmark room to be read instead of
 * shrinking it into an avatar.
 */
export type BrandMarkVariant = 'tile' | 'banner';

export default function BrandMark({
  src,
  name,
  variant = 'tile',
  bg,
  icon: Icon,
  className = '',
}: {
  src?: string;
  name: string;
  variant?: BrandMarkVariant;
  /** Brand colour to sit behind a logo that is white-on-transparent. */
  bg?: string;
  /**
   * The listing's category glyph, watermarked behind the initials so a
   * monogram still says what kind of place it is at a glance.
   */
  icon?: LucideIcon;
  className?: string;
}) {
  const banner = variant === 'banner';
  const shape = banner
    ? 'w-full h-20 rounded-xl'
    : `flex-shrink-0 rounded-2xl ${className}`;
  const base = `relative flex items-center justify-center overflow-hidden shadow-sm ${shape}`;

  if (src) {
    return (
      <span
        className={`${base} ring-1 ring-slate-200/80 ${bg ? '' : 'bg-white'}`}
        style={bg ? { backgroundColor: bg } : undefined}
      >
        <Image
          src={src}
          alt={`${name} logo`}
          fill
          sizes={banner ? '(min-width: 1024px) 22rem, 100vw' : '56px'}
          className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
            banner ? 'p-3' : 'p-1.5'
          }`}
        />
      </span>
    );
  }

  const h = hashString(name);
  const colour = MONOGRAM_COLORS[h % MONOGRAM_COLORS.length];
  const direction = GRADIENT_DIRECTIONS[(h >> 4) % GRADIENT_DIRECTIONS.length];
  const motif = MOTIFS[(h >> 8) % MOTIFS.length];

  return (
    <span
      className={`${base} ${direction} ${colour} ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.03]`}
      aria-hidden="true"
    >
      {/* Motif sits above the gradient but below everything else. */}
      <span className="absolute inset-0" style={{ backgroundImage: motif }} />

      {/* Category watermark — says what kind of place this is at a glance. */}
      {Icon && (
        <Icon
          className={
            banner
              ? 'absolute -right-3 -bottom-4 w-20 h-20 text-white/20'
              : 'absolute -right-1.5 -bottom-2 w-10 h-10 text-white/20'
          }
          strokeWidth={1.5}
        />
      )}

      <span
        className={`relative font-bold text-white drop-shadow-sm ${
          banner ? 'text-3xl tracking-[0.14em]' : 'tracking-[0.08em]'
        }`}
      >
        {getInitials(name)}
      </span>

      {/* Hairline inside the edge, which reads as a deliberate frame. */}
      <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
    </span>
  );
}
