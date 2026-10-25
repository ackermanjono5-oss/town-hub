'use client';

import Image from 'next/image';
import { ADVERTS, advertHref, type Advert } from '@/lib/garden-route/adverts';

/**
 * "Local partners" strip on the home screen, following the Town Hub
 * prototype: a horizontally scrolling row of fixed-width cards rather than
 * the rotating four-up grid this used to be.
 *
 * The prototype shows monogram tiles for every partner. Real logos exist
 * for most of these, so the tile prefers the artwork and falls back to
 * initials — a partner without a logo still gets a filled tile rather than
 * a gap, which was the point of the monogram in the first place.
 */

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => /[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function PartnerTile({ advert }: { advert: Advert }) {
  if (!advert.logo) {
    return (
      <div className="w-[38px] h-[38px] rounded-[10px] bg-[#f0fbfd] dark:bg-cyan-400/15 text-[#0e7490] dark:text-cyan-300 flex items-center justify-center text-sm font-extrabold">
        {initialsOf(advert.name)}
      </div>
    );
  }
  return (
    <div
      className="relative w-[38px] h-[38px] rounded-[10px] overflow-hidden p-1"
      style={{ backgroundColor: advert.logoBg ?? '#f0fbfd' }}
    >
      <Image
        src={advert.logo}
        alt=""
        fill
        sizes="38px"
        className="object-contain p-0.5"
      />
    </div>
  );
}

export default function AdvertCarousel() {
  return (
    <section className="pt-4">
      <div className="flex items-baseline justify-between px-5 pb-2.5">
        <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-secondary-foreground">
          <span className="w-6 h-[3px] rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef8a4c]" aria-hidden="true" />
          Local partners
        </h2>
        <a
          href="/contact"
          className="text-xs font-semibold text-[#b45309] dark:text-amber-400 hover:underline"
        >
          Advertise here
        </a>
      </div>

      <div className="flex gap-[11px] overflow-x-auto px-5 pt-1 pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADVERTS.map((advert) => (
          <a
            key={advert.id}
            href={advertHref(advert)}
            target="_blank"
            rel="noopener noreferrer"
            title={advert.name}
            className="flex-none w-[138px] p-3.5 rounded-[14px] bg-card border border-hairline text-left transition-all duration-150 hover:border-[#0e7490] hover:shadow-md active:scale-[0.98]"
          >
            <PartnerTile advert={advert} />
            <p className="mt-2.5 text-[13.5px] font-bold text-ink leading-snug">
              {advert.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-muted leading-snug">
              {advert.tagline}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
