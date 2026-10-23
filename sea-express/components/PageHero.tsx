import type { LucideIcon } from 'lucide-react';

/**
 * The banner at the top of a page. Every section gets its own colour so the
 * app reads as a set of distinct places rather than one long blue page, and
 * the wave along the bottom edge ties them back to the coast.
 *
 * Full class strings per theme, because Tailwind only keeps classes it can
 * see as literals.
 */
export type HeroTheme =
  | 'ocean'
  | 'lagoon'
  | 'forest'
  | 'sunset'
  | 'coral'
  | 'dusk'
  | 'ember'
  | 'slate';

const THEMES: Record<HeroTheme, { gradient: string; glow: string }> = {
  ocean: { gradient: 'from-[#0a2f5c] via-[#1c6cb8] to-[#31a8c9]', glow: 'bg-cyan-300/25' },
  lagoon: { gradient: 'from-[#0b3b3a] via-[#0f766e] to-[#2dd4bf]', glow: 'bg-emerald-200/25' },
  forest: { gradient: 'from-[#14321f] via-[#2f6b3a] to-[#84a83a]', glow: 'bg-lime-200/25' },
  sunset: { gradient: 'from-[#7a2e0e] via-[#e0662b] to-[#f6b44b]', glow: 'bg-amber-200/30' },
  coral: { gradient: 'from-[#6b1235] via-[#d4416a] to-[#ff8f7a]', glow: 'bg-rose-200/25' },
  dusk: { gradient: 'from-[#1e1b4b] via-[#4338ca] to-[#a855f7]', glow: 'bg-fuchsia-300/25' },
  ember: { gradient: 'from-[#5f0f13] via-[#c62828] to-[#f2643d]', glow: 'bg-orange-200/25' },
  slate: { gradient: 'from-[#1f2937] via-[#334155] to-[#64748b]', glow: 'bg-sky-200/20' },
};

export default function PageHero({
  eyebrow = 'Garden Route',
  title,
  subtitle,
  icon: Icon,
  theme = 'ocean',
  children,
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Shown as a badge beside the eyebrow and as a large faint watermark. */
  icon?: LucideIcon;
  theme?: HeroTheme;
  /** Buttons or stats under the subtitle. */
  children?: React.ReactNode;
  className?: string;
}) {
  const t = THEMES[theme];

  return (
    <section
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${t.gradient} text-white shadow-xl shadow-black/10 ${className}`}
    >
      {/* Soft light blooms and a faint dot texture, for depth. */}
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
      <div className={`absolute -bottom-28 -left-12 w-64 h-64 rounded-full ${t.glow} blur-3xl`} aria-hidden="true" />
      <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
      {Icon && (
        <Icon
          className="absolute -right-6 top-6 w-40 h-40 text-white/10 rotate-[-8deg]"
          strokeWidth={1.25}
          aria-hidden="true"
        />
      )}

      <div className="relative px-6 pt-7 pb-14 sm:px-10 sm:pt-10 sm:pb-16">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
          {Icon && (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/15 backdrop-blur ring-1 ring-white/20">
              <Icon className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
          )}
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[2rem] leading-[1.1] sm:text-5xl font-extrabold tracking-tight drop-shadow-sm">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85">{subtitle}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>

      {/* Wave along the bottom edge. */}
      <svg
        className="absolute bottom-0 left-0 w-full h-8 sm:h-10 text-white/20"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,48 C180,80 360,16 540,32 C720,48 900,80 1080,56 C1260,32 1350,40 1440,48 L1440,80 L0,80 Z"
        />
      </svg>
      <svg
        className="absolute bottom-0 left-0 w-full h-5 sm:h-6 text-white/30"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,56 C240,24 480,72 720,52 C960,32 1200,64 1440,40 L1440,80 L0,80 Z"
        />
      </svg>
    </section>
  );
}
