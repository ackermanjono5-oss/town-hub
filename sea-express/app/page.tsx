import Image from 'next/image';
import {
  Calendar,
  CloudSun,
  Siren,
  ShoppingBasket,
  Ticket,
  ScrollText,
  Users,
  UtensilsCrossed,
  Stethoscope,
  Store,
  Scale,
  BedDouble,
  BadgeCheck,
  ArrowRight,
  Newspaper,
  Leaf,
  Radio,
  type LucideIcon,
} from 'lucide-react';
import AdvertCarousel from '@/components/AdvertCarousel';
import Greeting from '@/components/Greeting';

/**
 * Home screen: an ocean banner with a time-of-day greeting, the directories
 * as colourful tiles, the local partners strip, quick links and the
 * emergency call to action.
 *
 * Phone-first. On a tablet the tiles go three across, and on a computer the
 * banner and the tiles sit side by side, so wide screens are filled rather
 * than left as a narrow column in empty space. The width stays capped to
 * the header's, so lines never get too long to read.
 */

// Full class strings, because Tailwind only keeps classes it can see as
// literals.
const DIRECTORIES: {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tile: string;
}[] = [
  {
    href: '/directory',
    label: 'Restaurants',
    hint: 'Eat & drink',
    icon: UtensilsCrossed,
    tile: 'from-[#f6b44b] via-[#ee7d3a] to-[#d9532a]',
  },
  {
    href: '/medical',
    label: 'Medical',
    hint: 'Doctors & pharmacies',
    icon: Stethoscope,
    tile: 'from-[#ff8f7a] via-[#e5566f] to-[#b8325a]',
  },
  {
    href: '/businesses',
    label: 'Businesses',
    hint: 'Shops & services',
    icon: Store,
    tile: 'from-[#4cc3dd] via-[#1c8ec4] to-[#155f9c]',
  },
  {
    href: '/accommodation',
    label: 'Stay',
    hint: 'Hotels & B&Bs',
    icon: BedDouble,
    tile: 'from-[#5fd3b9] via-[#14a38c] to-[#0e6e66]',
  },
  {
    href: '/attorneys',
    label: 'Attorneys',
    hint: 'Legal help',
    icon: Scale,
    tile: 'from-[#a78bfa] via-[#6d5ce8] to-[#3f36b5]',
  },
  {
    href: '/news',
    label: 'News',
    hint: 'Local papers',
    icon: Newspaper,
    tile: 'from-[#94a3b8] via-[#5b6b83] to-[#334155]',
  },
];

const QUICK_LINKS: { href: string; label: string; icon: LucideIcon; chip: string }[] = [
  { href: '/rewards', label: 'Rewards', icon: Ticket, chip: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300' },
  { href: '/weather', label: 'Weather', icon: CloudSun, chip: 'bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300' },
  { href: '/events', label: 'Events', icon: Calendar, chip: 'bg-fuchsia-100 dark:bg-fuchsia-400/15 text-fuchsia-700 dark:text-fuchsia-300' },
  { href: '/markets', label: 'Markets', icon: ShoppingBasket, chip: 'bg-lime-100 dark:bg-lime-400/15 text-lime-700 dark:text-lime-300' },
  { href: '/nature', label: 'Nature', icon: Leaf, chip: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300' },
  { href: '/radio', label: 'Radio', icon: Radio, chip: 'bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300' },
  { href: '/legal-notices', label: 'Notices', icon: ScrollText, chip: 'bg-slate-200 text-slate-700' },
  { href: '/community', label: 'Community', icon: Users, chip: 'bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300' },
];

export default function HomePage() {
  return (
    <div className="font-[family-name:var(--font-jakarta)] max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8 space-y-6 md:space-y-8">
      <div className="space-y-6 md:space-y-8 lg:grid lg:grid-cols-[1fr_1.15fr] lg:items-stretch lg:gap-6 lg:space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] lg:flex lg:flex-col lg:justify-center bg-gradient-to-br from-[#0a2f5c] via-[#1569a8] to-[#2fb2cf] text-white shadow-[0_24px_48px_-24px_rgba(10,47,92,0.8)]">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/15 blur-3xl drift" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-cyan-200/25 blur-3xl" aria-hidden="true" />
        <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />

        <div className="relative px-6 pt-6 pb-16">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/40 shadow-lg flex-none">
              <Image
                src="/town-hub-logo.jpg"
                alt="Town Hub — Connect. Discover. Live."
                width={112}
                height={112}
                className="w-full h-full object-cover"
                // Eager rather than `priority`: priority makes Next inject a
                // <link rel="preload" href="/town-hub-logo.jpg"> at runtime,
                // which the export's path rewrite never sees, so inside the
                // Android app (file://) it points at the device root and
                // fails — enough for the app shell to show "Couldn't load".
                loading="eager"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                Garden Route
              </p>
              <p className="text-lg font-bold leading-tight">
                <Greeting />
              </p>
            </div>
          </div>

          <h1 className="mt-6 text-[30px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.08] text-balance">
            Your town, <span className="text-[#ffd27a]">on one screen.</span>
          </h1>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/85 text-pretty">
            Places to eat and stay, doctors, news, weather, tides, rewards and emergency numbers —
            from Witsand to Storms River.
          </p>
        </div>

        {/* Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-10 text-white/20" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C180,80 360,16 540,32 C720,48 900,80 1080,56 C1260,32 1350,40 1440,48 L1440,80 L0,80 Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full h-6 text-white/30" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,56 C240,24 480,72 720,52 C960,32 1200,64 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* Directories */}
      <section>
        <SectionTitle>Explore</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIRECTORIES.map(({ href, label, hint, icon: Icon, tile }, i) => (
            <a
              key={href}
              href={href}
              style={{ ['--i' as string]: i }}
              className={`rise-in group relative overflow-hidden rounded-2xl bg-gradient-to-br ${tile} p-4 h-[112px] text-white shadow-[0_14px_26px_-16px_rgba(15,23,42,0.6)] transition-transform duration-200 active:scale-[0.97] hover:-translate-y-0.5`}
            >
              <Icon
                className="absolute -right-3 -bottom-3 w-20 h-20 text-white/15 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/25">
                <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
              </span>
              {/* A soft shadow keeps the text readable on the bright tiles, even outdoors. */}
              <span className="block mt-3 text-[15px] font-bold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.22)]">{label}</span>
              <span className="block mt-0.5 text-[12px] font-medium text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.28)]">{hint}</span>
            </a>
          ))}
        </div>

        {/* Featured: the rewards portal for businesses. */}
        <a
          href="/business"
          className="rise-in mt-3 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#14321f] via-[#2f6b3a] to-[#7a9a2e] p-4 text-white shadow-[0_14px_26px_-16px_rgba(20,50,31,0.8)] active:scale-[0.98] transition-transform"
          style={{ ['--i' as string]: DIRECTORIES.length }}
        >
          <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#ffd27a] text-[#14321f] flex-none shadow-md">
            <BadgeCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[15px] font-bold">Business Rewards Portal</span>
            <span className="block text-[12px] text-white/80">
              For Town Hub advertisers — run loyalty rewards and redeem vouchers.
            </span>
          </span>
          <ArrowRight className="w-5 h-5 text-white/80 flex-none" aria-hidden="true" />
        </a>
      </section>
      </div>

      {/* Partners */}
      <section className="rounded-3xl bg-card/80 backdrop-blur shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] overflow-hidden">
        <AdvertCarousel />
      </section>

      {/* Quick links */}
      <section>
        <SectionTitle>Quick links</SectionTitle>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
          {QUICK_LINKS.map(({ href, label, icon: Icon, chip }, i) => (
            <a
              key={href}
              href={href}
              style={{ ['--i' as string]: i }}
              className="rise-in flex flex-col items-center gap-1.5 rounded-2xl bg-card/85 backdrop-blur py-3 px-1 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.5)] ring-1 ring-white/70 dark:ring-white/10 transition-transform active:scale-[0.95] hover:-translate-y-0.5"
            >
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${chip}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-[11.5px] font-semibold text-ink text-center leading-tight">{label}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Emergency */}
      <a
        href="/sos"
        className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#f2643d] p-5 text-white shadow-[0_18px_34px_-18px_rgba(220,38,38,0.95)] active:scale-[0.98] transition-transform"
      >
        <span className="relative flex-none">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" aria-hidden="true" />
          <span className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-[#dc2626] shadow-lg">
            <Siren className="w-6 h-6" aria-hidden="true" />
          </span>
        </span>
        <span className="flex-1">
          <span className="block text-lg font-extrabold tracking-wide">Emergency SOS</span>
          <span className="block text-[12.5px] text-white/85">Police, ambulance, fire and sea rescue — one tap to call.</span>
        </span>
        <ArrowRight className="w-5 h-5 text-white/85 flex-none" aria-hidden="true" />
      </a>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
      <span className="w-6 h-[3px] rounded-full bg-gradient-to-r from-[#1c6cb8] to-[#2fb2cf]" aria-hidden="true" />
      {children}
    </h2>
  );
}
