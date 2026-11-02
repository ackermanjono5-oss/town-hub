'use client';

import { useEffect, useRef } from 'react';

/**
 * A scrolling row of town pills, matching the town filters on the directory
 * pages. The chosen town is scrolled into view, so a town picked from far
 * down the coast isn't left hidden off the edge.
 */
export default function TownPills({
  towns,
  value,
  onChange,
  label = 'Town',
}: {
  towns: readonly { slug: string; label: string }[];
  value: string;
  onChange: (slug: string) => void;
  label?: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !active || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2;
  }, [value]);

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <div
        ref={rowRef}
        role="group"
        aria-label={label}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]"
      >
        {towns.map((t) => {
          const active = t.slug === value;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => onChange(t.slug)}
              aria-pressed={active}
              className={[
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-slate-200 bg-card text-slate-600 hover:bg-slate-100',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
