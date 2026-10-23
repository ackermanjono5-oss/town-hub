'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  Globe,
  Search,
  Navigation,
  BedDouble,
  Hotel,
  Home,
  Backpack,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import DirectoryPhoto from '@/components/DirectoryPhoto';
import BrandMark from '@/components/BrandMark';
import {
  getAccommodationMapsUrl,
  type Accommodation,
} from '@/lib/garden-route/accommodation';
import { countWithLogos } from '@/lib/garden-route/display';
import { getStayLogo, VISIBLE_STAYS } from '@/lib/garden-route/stay-logos';

type Accent = 'amber' | 'sky' | 'emerald' | 'slate';

const CATEGORY_META: Record<string, { icon: LucideIcon; accent: Accent }> = {
  Hotel: { icon: Hotel, accent: 'amber' },
  'Guest House': { icon: Home, accent: 'sky' },
  Hostel: { icon: Backpack, accent: 'emerald' },
};

const DEFAULT_META = { icon: BedDouble, accent: 'slate' as Accent };

// Full class strings — Tailwind only keeps classes it can see as literals.
const ACCENT_CLASSES: Record<Accent, { badge: string; chip: string; bar: string }> = {
  amber: { badge: 'bg-amber-100 text-amber-700', chip: 'bg-amber-600 text-white border-amber-600', bar: 'bg-amber-500' },
  sky: { badge: 'bg-sky-100 text-sky-700', chip: 'bg-sky-600 text-white border-sky-600', bar: 'bg-sky-500' },
  emerald: { badge: 'bg-emerald-100 text-emerald-700', chip: 'bg-emerald-600 text-white border-emerald-600', bar: 'bg-emerald-500' },
  slate: { badge: 'bg-slate-200 text-slate-700', chip: 'bg-slate-700 text-white border-slate-700', bar: 'bg-slate-500' },
};

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

const PAGE_SIZE = 36;

function metaFor(category: string) {
  return CATEGORY_META[category] ?? DEFAULT_META;
}

export default function AccommodationPage() {
  const [town, setTown] = useState('all');
  const [category, setCategory] = useState<'All' | string>('All');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const inTown = useMemo(
    () =>
      town === 'all' ? VISIBLE_STAYS : VISIBLE_STAYS.filter((s) => s.town === town),
    [town]
  );

  const stays = useMemo(() => {
    let list = inTown;
    if (category !== 'All') list = list.filter((s) => s.category === category);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)
    );
  }, [inTown, category, search]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [town, category, search]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of inTown) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return map;
  }, [inTown]);

  const categories = [...counts.keys()].sort(
    (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0)
  );
  const withLogos = countWithLogos(inTown, getStayLogo);
  const shown = stays.slice(0, visible);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3b3a] via-[#0f766e] to-[#2dd4bf] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">
            Hotels &amp; B&amp;Bs
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Hotels, guest houses and backpackers from Mossel Bay to Plettenberg
            Bay — book direct, call, or navigate straight there.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={inTown.length} label="places to stay" />
            <Stat value={categories.length} label="types" />
            <Stat value={withLogos} label="with logos" />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-6 rounded-2xl bg-white/85 backdrop-blur border border-white/60 shadow-lg p-4 sm:p-5">
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
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',
                ].join(' ')}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-4">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search a hotel, guest house or backpackers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {categories.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              <CategoryChip
                label="All"
                count={inTown.length}
                active={category === 'All'}
                onClick={() => setCategory('All')}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c}
                  label={c}
                  icon={metaFor(c).icon}
                  count={counts.get(c) ?? 0}
                  active={category === c}
                  activeClass={ACCENT_CLASSES[metaFor(c).accent].chip}
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
          {stays.length} {stays.length === 1 ? 'place' : 'places'}
          {town !== 'all' && ` in ${getTownLabel(town)}`}
        </h2>
        {(category !== 'All' || search) && (
          <button
            type="button"
            onClick={() => {
              setCategory('All');
              setSearch('');
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {stays.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-white/80 border border-white/60 p-8 text-center shadow">
          <BedDouble className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">Nothing matches</p>
          <p className="mt-1 text-sm text-slate-500">
            Try another town, or clear the filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shown.map((stay) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>

          {visible < stays.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Show more ({stays.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Listings from OpenStreetMap, © OpenStreetMap contributors. Logos belong
        to their respective owners.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
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
        active ? `${activeClass} shadow-sm` : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',
      ].join(' ')}
    >
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      {label}
      <span
        className={[
          'ml-0.5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold',
          active ? 'bg-white/25' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

function StayCard({ stay }: { stay: Accommodation }) {
  const { accent } = metaFor(stay.category);
  const classes = ACCENT_CLASSES[accent];
  const logo = getStayLogo(stay);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className={`absolute left-0 top-0 h-full w-1 ${classes.bar}`} aria-hidden="true" />

      <DirectoryPhoto src={stay.image} alt={stay.name} />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark src={logo} name={stay.name} variant="banner" icon={metaFor(stay.category).icon} />

        <h3 className="mt-4 font-semibold text-slate-900 leading-snug">{stay.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${classes.badge}`}>
            {stay.category}
          </span>
          <span className="text-xs text-slate-400">{getTownLabel(stay.town)}</span>
        </div>

        {stay.phone && (
          <a
            href={`tel:${stay.phone.replace(/\s/g, '')}`}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {stay.phone}
          </a>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {stay.phone && (
            <a
              href={`tel:${stay.phone.replace(/\s/g, '')}`}
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call
            </a>
          )}
          {stay.website && (
            <a
              href={stay.website}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ACTION} bg-emerald-600 text-white shadow-sm hover:brightness-110`}
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              Book direct
            </a>
          )}
          <a
            href={getAccommodationMapsUrl(stay)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-accent" aria-hidden="true" />
            Navigate
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${stay.name} ${getTownLabel(stay.town)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
            Find
          </a>
        </div>
      </div>
    </article>
  );
}
