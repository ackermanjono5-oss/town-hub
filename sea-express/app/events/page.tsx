'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Globe,
  CalendarPlus,
  Navigation,
  BadgeCheck,
  Users,
  Palette,
  Music,
  UtensilsCrossed,
  Bike,
  Flag,
  PartyPopper,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import DirectoryPhoto from '@/components/DirectoryPhoto';
import {
  EVENTS,
  EVENT_CATEGORIES,
  daysUntil,
  getAddToCalendarUrl,
  getEventStatus,
  sortEvents,
  type Event,
  type EventCategory,
} from '@/lib/garden-route/events';

type Accent = 'rose' | 'emerald' | 'sky' | 'violet' | 'amber' | 'teal' | 'fuchsia';

const CATEGORY_META: Record<EventCategory, { icon: LucideIcon; accent: Accent }> = {
  Community: { icon: Users, accent: 'sky' },
  Arts: { icon: Palette, accent: 'violet' },
  Music: { icon: Music, accent: 'fuchsia' },
  'Food & Drink': { icon: UtensilsCrossed, accent: 'amber' },
  Sport: { icon: Bike, accent: 'emerald' },
  Motorsport: { icon: Flag, accent: 'rose' },
  Nightlife: { icon: PartyPopper, accent: 'teal' },
};

// Full class strings — Tailwind only keeps classes it can see as literals.
const ACCENT_CLASSES: Record<Accent, { badge: string; chip: string; bar: string }> = {
  rose: { badge: 'bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300', chip: 'bg-rose-600 text-white border-rose-600', bar: 'bg-rose-500' },
  emerald: { badge: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300', chip: 'bg-emerald-600 text-white border-emerald-600', bar: 'bg-emerald-500' },
  sky: { badge: 'bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300', chip: 'bg-sky-600 text-white border-sky-600', bar: 'bg-sky-500' },
  violet: { badge: 'bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300', chip: 'bg-violet-600 text-white border-violet-600', bar: 'bg-violet-500' },
  amber: { badge: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300', chip: 'bg-amber-600 text-white border-amber-600', bar: 'bg-amber-500' },
  teal: { badge: 'bg-teal-100 dark:bg-teal-400/15 text-teal-700 dark:text-teal-300', chip: 'bg-teal-600 text-white border-teal-600', bar: 'bg-teal-500' },
  fuchsia: { badge: 'bg-fuchsia-100 dark:bg-fuchsia-400/15 text-fuchsia-700 dark:text-fuchsia-300', chip: 'bg-fuchsia-600 text-white border-fuchsia-600', bar: 'bg-fuchsia-500' },
};

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

function mapsUrl(event: Event): string {
  const query = event.venue ?? `${event.name} ${getTownLabel(event.town)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function EventsPage() {
  const [town, setTown] = useState('all');
  const [category, setCategory] = useState<'All' | EventCategory>('All');

  const inTown = useMemo(
    () => (town === 'all' ? EVENTS : EVENTS.filter((e) => e.town === town)),
    [town]
  );

  const events = useMemo(() => {
    const list = category === 'All' ? inTown : inTown.filter((e) => e.category === category);
    return sortEvents(list);
  }, [inTown, category]);

  const counts = useMemo(() => {
    const map = new Map<EventCategory, number>();
    for (const e of inTown) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    return map;
  }, [inTown]);

  const dated = inTown.filter((e) => getEventStatus(e) === 'upcoming' || getEventStatus(e) === 'on-now');
  const onNow = inTown.filter((e) => getEventStatus(e) === 'on-now').length;
  const nextUp = sortEvents(dated)[0];
  const nextDays = nextUp ? daysUntil(nextUp) : null;
  const availableCategories = EVENT_CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#4338ca] to-[#a855f7] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Events Calendar</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Festivals, races and markets across the Garden Route — with dates,
            directions and one tap to save it to your calendar.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={String(dated.length)} label="dated events" />
            {onNow > 0 && <Stat value={String(onNow)} label="on now" />}
            {nextUp && nextDays !== null && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
                <CalendarDays className="w-4 h-4" aria-hidden="true" />
                <span className="text-white/75">Next:</span>
                <strong>{nextUp.name}</strong>
                <span className="text-white/75">
                  in {nextDays} {nextDays === 1 ? 'day' : 'days'}
                </span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-6 rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Town</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {[{ slug: 'all', label: 'All towns' }, ...TOWNS].map((t) => {
            const active = t.slug === town;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTown(t.slug)}
                aria-pressed={active}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition active:scale-95',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100',
                ].join(' ')}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {availableCategories.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              <CategoryChip
                label="All"
                count={inTown.length}
                active={category === 'All'}
                onClick={() => setCategory('All')}
              />
              {availableCategories.map((c) => (
                <CategoryChip
                  key={c}
                  label={c}
                  icon={CATEGORY_META[c].icon}
                  count={counts.get(c) ?? 0}
                  active={category === c}
                  activeClass={ACCENT_CLASSES[CATEGORY_META[c].accent].chip}
                  onClick={() => setCategory(category === c ? 'All' : c)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Results */}
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {events.length} {events.length === 1 ? 'event' : 'events'}
          {town !== 'all' && ` in ${getTownLabel(town)}`}
        </h2>
        {category !== 'All' && (
          <button
            type="button"
            onClick={() => setCategory('All')}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
          <Calendar className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">
            {town === 'all'
              ? 'No events match this filter'
              : `Nothing listed in ${getTownLabel(town)} yet`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try &ldquo;All towns&rdquo; — most Garden Route festivals run in Knysna,
            Plettenberg Bay and Mossel Bay.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Events marked <BadgeCheck className="inline w-3.5 h-3.5 -mt-0.5" /> have dates
        confirmed on the organiser&apos;s own website. Annual festivals without
        confirmed dates show the month they normally run — check the organiser
        before travelling.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
      <strong className="text-base font-bold">{value}</strong>
      <span className="text-white/75">{label}</span>
    </span>
  );
}

function CategoryChip({
  label,
  icon: Icon,
  count,
  active,
  activeClass = 'bg-primary text-primary-foreground border-primary',
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  count: number;
  active: boolean;
  activeClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium border transition active:scale-95',
        active ? `${activeClass} shadow-sm` : 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100',
      ].join(' ')}
    >
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      {label}
      <span
        className={[
          'ml-0.5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold',
          active ? 'bg-black/20' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

function StatusPill({ event }: { event: Event }) {
  const status = getEventStatus(event);
  const days = daysUntil(event);

  if (status === 'on-now') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
        On now
      </span>
    );
  }
  if (status === 'upcoming' && days !== null) {
    return (
      <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300 text-[11px] font-bold uppercase tracking-wide">
        In {days} {days === 1 ? 'day' : 'days'}
      </span>
    );
  }
  if (status === 'annual') {
    return (
      <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wide">
        Annual
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
      Finished
    </span>
  );
}

function EventCard({ event }: { event: Event }) {
  const { icon: Icon, accent } = CATEGORY_META[event.category];
  const classes = ACCENT_CLASSES[accent];
  const calendarUrl = getAddToCalendarUrl(event);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className={`absolute left-0 top-0 h-full w-1 ${classes.bar}`} aria-hidden="true" />

      <DirectoryPhoto src={event.image} alt={event.name} />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <div className="flex items-start gap-3">
          <span className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${classes.badge}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5">
              <h3 className="font-bold text-lg text-slate-900 leading-snug">{event.name}</h3>
              {event.verified && (
                <BadgeCheck
                  className="w-4 h-4 mt-1 flex-shrink-0 text-sky-600 dark:text-sky-400"
                  aria-label="Dates confirmed on the organiser's website"
                />
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${classes.badge}`}>
                {event.category}
              </span>
              <StatusPill event={event} />
            </div>
          </div>
        </div>

        {event.logo && (
          <div className="relative w-40 h-14 mt-4">
            <Image
              src={event.logo}
              alt={`${event.name} logo`}
              fill
              sizes="160px"
              className="object-contain object-left"
            />
          </div>
        )}

        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Calendar className="w-4 h-4 flex-shrink-0 text-accent" aria-hidden="true" />
          {event.dateLabel}
        </p>

        <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span>{event.venue ?? getTownLabel(event.town)}</span>
        </p>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{event.description}</p>

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {calendarUrl && (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <CalendarPlus className="w-4 h-4" aria-hidden="true" />
              Add to calendar
            </a>
          )}
          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_GHOST}
            >
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Website
            </a>
          )}
          <a
            href={mapsUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-accent" aria-hidden="true" />
            Directions
          </a>
        </div>
      </div>
    </article>
  );
}
