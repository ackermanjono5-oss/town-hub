'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ADVERTS, type Advert } from '@/lib/garden-route/adverts';

const PAGE_SIZE = 4;
const ROTATE_MS = 5000;
const FADE_MS = 300;

// Splits into fixed-size pages, wrapping around the list to pad out the
// final page so every rotation always fills a full 4-column grid.
function paginate(items: Advert[], pageSize: number): Advert[][] {
  if (items.length <= pageSize) return [items];
  const pages: Advert[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    const page: Advert[] = [];
    for (let j = 0; j < pageSize; j += 1) {
      page.push(items[(i + j) % items.length]);
    }
    pages.push(page);
  }
  return pages;
}

const PAGES = paginate(ADVERTS, PAGE_SIZE);

export default function AdvertCarousel() {
  const [pageIndex, setPageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (PAGES.length <= 1) return;
    let fadeTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setPageIndex((i) => (i + 1) % PAGES.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, []);

  const page = PAGES[pageIndex];

  return (
    <div className="mt-12">
      <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
        Our Adverts
      </p>
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 transition-opacity ease-in-out"
        style={{ transitionDuration: `${FADE_MS}ms`, opacity: visible ? 1 : 0 }}
      >
        {page.map((advert, i) => (
          <a
            key={`${advert.id}-${i}`}
            href={advert.website}
            target="_blank"
            rel="noopener noreferrer"
            title={advert.name}
            className="group flex flex-col items-center rounded-xl border border-border overflow-hidden hover:border-primary hover:shadow-lg card-lift"
          >
            <div
              className="relative w-full h-20 p-3"
              style={{ backgroundColor: advert.logoBg ?? '#ffffff' }}
            >
              <Image
                src={advert.logo}
                alt={advert.name}
                fill
                sizes="140px"
                className="object-contain"
              />
            </div>
            <div className="w-full px-2 py-2 bg-background text-center">
              <p className="text-xs font-semibold text-foreground leading-tight">{advert.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{advert.tagline}</p>
            </div>
          </a>
        ))}
      </div>
      {PAGES.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {PAGES.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === pageIndex ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
