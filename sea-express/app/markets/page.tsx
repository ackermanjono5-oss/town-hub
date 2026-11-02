'use client';

import { useMemo, useState } from 'react';
import {
  ShoppingBasket,
  Globe,
  Navigation,
  Clock,
  MapPin,
  Search,
  Sprout,
  Palette,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import BrandMark from '@/components/BrandMark';
import { MARKETS, getMarketMapsUrl, type Market } from '@/lib/garden-route/markets';

type Accent = 'emerald' | 'amber' | 'fuchsia' | 'slate';

const TYPE_META: Record<string, { icon: LucideIcon; accent: Accent }> = {
  'Farmers Market': { icon: Sprout, accent: 'emerald' },
  'Farm Stall': { icon: Sprout, accent: 'emerald' },
  Produce: { icon: Sprout, accent: 'emerald' },
  'Craft & Food': { icon: Palette, accent: 'fuchsia' },
  Craft: { icon: Palette, accent: 'fuchsia' },
  Market: { icon: ShoppingBasket, accent: 'amber' },
};

const DEFAULT_META = { icon: ShoppingBasket, accent: 'slate' as Accent };

// Full class strings — Tailwind only keeps classes it can see as literals.
const ACCENT_CLASSES: Record<Accent, { badge: string; chip: string; bar: string }> = {
  emerald: { badge: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300', chip: 'bg-emerald-600 text-white border-emerald-600', bar: 'bg-emerald-500' },
  amber: { badge: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300', chip: 'bg-amber-600 text-white border-amber-600', bar: 'bg-amber-500' },
  fuchsia: { badge: 'bg-fuchsia-100 dark:bg-fuchsia-400/15 text-fuchsia-700 dark:text-fuchsia-300', chip: 'bg-fuchsia-600 text-white border-fuchsia-600', bar: 'bg-fuchsia-500' },
  slate: { badge: 'bg-slate-200 text-slate-700', chip: 'bg-[#334155] dark:bg-[#3e5a78] text-white border-[#334155] dark:border-[#3e5a78]', bar: 'bg-[#64748b]' },
};

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

function metaFor(type: string) {
  return TYPE_META[type] ?? DEFAULT_META;
}

export default function MarketsPage() {
  const [town, setTown] = useState('all');
  const [search, setSearch] = useState('');

  const inTown = useMemo(
    () => (town === 'all' ? MARKETS : MARKETS.filter((m) => m.town === town)),
    [town]
  );

  const markets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inTown;
    return inTown.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.type.toLowerCase().includes(query) ||
        (m.location ?? '').toLowerCase().includes(query)
    );
  }, [inTown, search]);

  const withSchedule = inTown.filter((m) => m.schedule).length;
  const townsCovered = new Set(MARKETS.map((m) => m.town)).size;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14321f] via-[#2f6b3a] to-[#84a83a] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">
            Markets &amp; Farm Stalls
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Farmers&apos; markets, craft markets and roadside farm stalls across
            the Garden Route — with days, times and directions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={inTown.length} label="markets" />
            <Stat value={townsCovered} label="towns" />
            <Stat value={withSchedule} label="with times" />
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

        <div className="relative mt-4">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search a market or farm stall…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-card text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </section>

      {/* Results */}
      <h2 className="mt-6 text-xl sm:text-2xl font-bold text-slate-900">
        {markets.length} {markets.length === 1 ? 'market' : 'markets'}
        {town !== 'all' && ` in ${getTownLabel(town)}`}
      </h2>

      {markets.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
          <ShoppingBasket className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">
            {town === 'all' ? 'Nothing matches' : `Nothing listed in ${getTownLabel(town)} yet`}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Sedgefield, George and Knysna have the most markets on the route.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Market listings from OpenStreetMap, © OpenStreetMap contributors, plus
        hand-checked entries. Times change seasonally — confirm before
        travelling.
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

function MarketCard({ market }: { market: Market }) {
  const { accent } = metaFor(market.type);
  const classes = ACCENT_CLASSES[accent];

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className={`absolute left-0 top-0 h-full w-1 ${classes.bar}`} aria-hidden="true" />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark name={market.name} variant="banner" icon={metaFor(market.type).icon} />

        <h3 className="mt-4 font-semibold text-slate-900 leading-snug">{market.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${classes.badge}`}>
            {market.type}
          </span>
          <span className="text-xs text-slate-500">{getTownLabel(market.town)}</span>
        </div>

        {market.schedule && (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Clock className="w-4 h-4 flex-shrink-0 text-accent" aria-hidden="true" />
            {market.schedule}
          </p>
        )}

        {market.location && (
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <span>{market.location}</span>
          </p>
        )}

        {market.description && (
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{market.description}</p>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          <a
            href={getMarketMapsUrl(market)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Navigate
          </a>
          {market.website && (
            <a
              href={market.website}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_GHOST}
            >
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Website
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
