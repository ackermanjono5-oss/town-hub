'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_DOODLE,
  findDoodle,
  pickDoodle,
  southAfricaNow,
  type Doodle,
  type DoodleAccent,
  type DoodleGlyph,
} from '@/lib/doodles';
import { AccentArt, renderGlyph } from '@/components/doodle/art';
import DoodleScene from '@/components/doodle/DoodleScene';

/**
 * The "Town Hub" wordmark with a daily doodle: the "o" becomes a small
 * animated picture, an animated detail sits after the name, and a caption
 * underneath says what today is. Tapping it opens a card with the full
 * scene and a fact about the day. See lib/doodles.ts for the calendar.
 *
 * The pages are prerendered once at build time, so today's doodle can only
 * be chosen in the browser. The first render uses a fixed default so the
 * prerendered HTML and the first client render agree.
 */
export default function DailyDoodle() {
  const [doodle, setDoodle] = useState<Doodle & { night?: boolean }>(DEFAULT_DOODLE);
  const [hour, setHour] = useState(12);
  const [open, setOpen] = useState(false);
  // Bumped on every tap so the letters hop again.
  const [hops, setHops] = useState(0);

  useEffect(() => {
    // ?doodle=<id> previews a specific design, e.g. ?doodle=heritage, and
    // ?hour=<0-23> previews it at another time of day.
    const params = new URLSearchParams(window.location.search);
    const preview = params.get('doodle');
    const forced = preview ? findDoodle(preview) : undefined;
    const forcedHour = params.has('hour') ? Number(params.get('hour')) % 24 : undefined;
    const update = () => {
      const h = forcedHour ?? southAfricaNow().hour;
      setHour(h);
      setDoodle(forced ? { ...forced, night: h >= 19 || h < 5 } : pickDoodle());
    };
    update();
    // Catches midnight and the switch to the night version while the app
    // stays open.
    const timer = window.setInterval(update, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const [T, w, n, H, u, b] = doodle.letters;
  const night = Boolean(doodle.night);
  const letters: { key: string; node: React.ReactNode }[] = [
    { key: 'T', node: <span style={{ color: T }}>T</span> },
    { key: 'o', node: <Glyph glyph={doodle.glyph} night={night} /> },
    { key: 'w', node: <span style={{ color: w }}>w</span> },
    { key: 'n', node: <span style={{ color: n }}>n</span> },
    { key: ' ', node: <span className="block w-[0.28em]" /> },
    { key: 'H', node: <span style={{ color: H }}>H</span> },
    { key: 'u', node: <span style={{ color: u }}>u</span> },
    { key: 'b', node: <span style={{ color: b }}>b</span> },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setHops((x) => x + 1);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Town Hub. Today's doodle: ${doodle.caption}`}
        className="flex min-w-0 flex-col items-start rounded-lg text-left leading-none"
      >
        <span key={`${doodle.id}-${hops}`} className="flex items-end text-[19px] font-extrabold tracking-[-0.02em]">
          {letters.map((l, i) => (
            <span key={l.key} className="doodle-hop" style={{ animationDelay: `${i * 55}ms` }}>
              {l.node}
            </span>
          ))}
          <Accent accent={doodle.accent} />
        </span>
        <span
          className="mt-[3px] max-w-[11.5rem] truncate text-[10.5px] font-semibold tracking-[0.01em]"
          style={{ color: doodle.tint }}
        >
          {doodle.caption}
        </span>
      </button>

      {open && <DoodleCard doodle={doodle} hour={hour} onClose={() => setOpen(false)} />}
    </>
  );
}

function DoodleCard({ doodle, hour, onClose }: { doodle: Doodle; hour: number; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const today = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 animate-[fadeIn_200ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doodle-card-title"
        className="doodle-pop relative mx-auto mt-16 w-[calc(100%-32px)] max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.55)] ring-1 ring-black/5"
      >
        <DoodleScene doodle={doodle} hour={hour} />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-slate-700 shadow-sm backdrop-blur transition active:scale-90"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="px-5 pb-5 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: doodle.tint }}>
            {today} · Garden Route
          </p>
          <h2 id="doodle-card-title" className="mt-1.5 text-[19px] font-extrabold leading-snug text-slate-900">
            {doodle.caption}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{doodle.fact}</p>
          <p className="mt-4 text-[11px] text-slate-400">A new Town Hub doodle every day.</p>
        </div>
      </div>
    </div>
  );
}

/** Stands in for the "o": sized to the x-height and sitting on the baseline. */
function Glyph({ glyph, night }: { glyph: DoodleGlyph; night: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mx-[0.03em] mb-[0.06em] block h-[0.74em] w-[0.74em] overflow-visible"
    >
      {renderGlyph(glyph, night)}
    </svg>
  );
}

function Accent({ accent }: { accent: DoodleAccent }) {
  if (accent === 'none') return null;
  return (
    <svg
      viewBox="0 0 28 20"
      aria-hidden="true"
      className="ml-1 mb-[0.12em] h-[0.9em] w-[1.26em] flex-none overflow-hidden"
    >
      <AccentArt accent={accent} />
    </svg>
  );
}
