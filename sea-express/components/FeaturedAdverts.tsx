'use client';

import { useEffect, useRef, useState } from 'react';
import { FRONT_PAGE_ADS } from '@/lib/garden-route/sponsored';
import { appHref } from '@/lib/app-nav';
import AdActions from '@/components/AdActions';

const ROTATE_MS = 6000;

/**
 * The front-page adverts, taking turns: they slide every few seconds, can be
 * swiped, and stop rotating once someone touches them. Each poster keeps its
 * own buttons underneath, so phone numbers and links are always sharp and
 * tappable whatever the artwork's resolution.
 */
export default function FeaturedAdverts() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Keep the dots in step with swiping.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const onScroll = () => setIndex(Math.round(row.scrollLeft / row.clientWidth));
    row.addEventListener('scroll', onScroll, { passive: true });
    return () => row.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (paused || FRONT_PAGE_ADS.length < 2) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      const row = rowRef.current;
      if (!row) return;
      const next = (Math.round(row.scrollLeft / row.clientWidth) + 1) % FRONT_PAGE_ADS.length;
      row.scrollTo({ left: next * row.clientWidth, behavior: 'smooth' });
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const goTo = (i: number) => {
    setPaused(true);
    const row = rowRef.current;
    row?.scrollTo({ left: i * row.clientWidth, behavior: 'smooth' });
  };

  return (
    // overflow-hidden: mobile browsers otherwise size the page to the
    // slides waiting off to the side, letting the whole page pan sideways.
    <div className="overflow-hidden rounded-3xl bg-card/85 p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5">
      <div
        ref={rowRef}
        onPointerDown={() => setPaused(true)}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
      >
        {FRONT_PAGE_ADS.map((ad, i) => (
          <figure
            key={ad.id}
            className="w-full flex-none snap-center px-0.5"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${FRONT_PAGE_ADS.length}: ${ad.name}`}
          >
            {/* Every slide gets the same frame, so the buttons sit in the same
                place and the carousel doesn't jump between posters. */}
            <div className="mx-auto flex aspect-[588/627] w-full max-w-[420px] items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={appHref(ad.image)}
                alt={ad.alt}
                width={ad.width}
                height={ad.height}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-auto max-h-full w-auto max-w-full rounded-2xl object-contain shadow-md ring-1 ring-black/5"
              />
            </div>
            <figcaption className="sr-only">{ad.name}</figcaption>
            <AdActions actions={ad.actions} className="mt-3 justify-center" />
          </figure>
        ))}
      </div>

      {FRONT_PAGE_ADS.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {FRONT_PAGE_ADS.map((ad, i) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${ad.name}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
