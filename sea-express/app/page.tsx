import Image from 'next/image';
import {
  Calendar,
  CloudSun,
  Siren,
  ShoppingBasket,
  Ticket,
  type LucideIcon,
} from 'lucide-react';
import AdvertCarousel from '@/components/AdvertCarousel';

/**
 * Home screen, following the Town Hub prototype: a centred hero on a soft
 * teal-to-white wash, three full-width directory buttons, the local
 * partners strip, a two-up quick links grid and the emergency call to
 * action.
 *
 * Widths are capped rather than left to fill the viewport — the prototype
 * is a phone mockup, and its 20px gutters become very long line lengths on
 * a tablet or desktop browser.
 */

const DIRECTORIES = [
  { href: '/directory', label: 'Restaurant Directory' },
  { href: '/medical', label: 'Medical Directory' },
  { href: '/businesses', label: 'Business Directory' },
];

const QUICK_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/weather', label: 'Weather & Tides', icon: CloudSun },
  { href: '/rewards', label: 'Rewards', icon: Ticket },
  { href: '/markets', label: 'Markets', icon: ShoppingBasket },
];

export default function HomePage() {
  return (
    <div className="font-[family-name:var(--font-jakarta)] bg-white">
      {/* Hero */}
      <section className="px-5 pt-7 pb-6 text-center bg-[linear-gradient(170deg,#f0fbfd_0%,#ffffff_100%)] border-b border-[#e5e7eb]">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-3.5 rounded-[22px] overflow-hidden shadow-[0_16px_30px_-14px_rgba(14,116,144,0.7)]">
            <Image
              src="/town-hub-logo.jpg"
              alt="Town Hub — Connect. Discover. Live."
              width={192}
              height={192}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          <h1 className="text-[27px] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#1f2937]">
            Your town, on one screen
          </h1>
          <p className="mt-2 text-sm text-[#6b7280] text-pretty">
            Directories, news, weather, tides and emergency numbers for the
            Garden Route.
          </p>

          <div className="mt-5 flex flex-col gap-[9px]">
            {DIRECTORIES.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="px-[18px] py-[13px] rounded-full bg-[#0e7490] text-white text-[14.5px] font-bold shadow-[0_10px_20px_-12px_rgba(14,116,144,0.9)] transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-md mx-auto">
        <AdvertCarousel />
      </div>

      {/* Quick links */}
      <section className="px-5 pt-4 pb-6 border-t border-[#e5e7eb] bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-[#6b7280]">
            Quick links
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-[11px] rounded-xl border border-[#e5e7eb] bg-white text-[13px] font-semibold text-[#1f2937] transition-all duration-150 hover:bg-[#f9fafb] hover:border-[#0e7490] active:scale-[0.98]"
              >
                <Icon
                  className="w-[15px] h-[15px] flex-none text-[#0e7490]"
                  aria-hidden="true"
                />
                {label}
              </a>
            ))}
          </div>

          <a
            href="/sos"
            className="mt-3 w-full flex items-center justify-center gap-2.5 p-3.5 rounded-[14px] bg-[#dc2626] text-white text-[15px] font-extrabold tracking-[0.04em] shadow-[0_12px_22px_-12px_rgba(220,38,38,0.9)] transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            <Siren className="w-[18px] h-[18px]" aria-hidden="true" />
            Emergency SOS
          </a>
        </div>
      </section>
    </div>
  );
}
