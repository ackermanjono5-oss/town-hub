'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Phone,
  Globe,
  Search,
  Store,
  Navigation,
  UtensilsCrossed,
  Shirt,
  Car,
  Hammer,
  Smartphone,
  Bike,
  ShoppingBag,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import DirectoryPhoto from '@/components/DirectoryPhoto';
import BrandMark from '@/components/BrandMark';
import { getBusinessMapsUrl, type Business } from '@/lib/garden-route/businesses';
import { countWithLogos } from '@/lib/garden-route/display';
import {
  BUSINESS_GROUPS,
  VISIBLE_BUSINESSES,
  countByGroup,
  getBusinessGroup,
  getBusinessLogo,
  type BusinessGroup,
} from '@/lib/garden-route/business-groups';

type Accent = 'amber' | 'rose' | 'sky' | 'emerald' | 'violet' | 'teal' | 'fuchsia' | 'slate';

const GROUP_META: Record<BusinessGroup, { icon: LucideIcon; accent: Accent }> = {
  'Food & Drink': { icon: UtensilsCrossed, accent: 'amber' },
  Shopping: { icon: ShoppingBag, accent: 'fuchsia' },
  'Fashion & Beauty': { icon: Shirt, accent: 'rose' },
  'Home & DIY': { icon: Hammer, accent: 'teal' },
  Motoring: { icon: Car, accent: 'sky' },
  Tech: { icon: Smartphone, accent: 'violet' },
  'Sport & Outdoor': { icon: Bike, accent: 'emerald' },
  Services: { icon: Briefcase, accent: 'slate' },
  Other: { icon: Store, accent: 'slate' },
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
  slate: { badge: 'bg-slate-200 text-slate-700', chip: 'bg-[#334155] dark:bg-[#3e5a78] text-white border-[#334155] dark:border-[#3e5a78]', bar: 'bg-[#64748b]' },
};

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

// 672 listings is far too many to put in the DOM at once on a phone, so the
// grid grows in pages as the reader asks for more.
const PAGE_SIZE = 48;

export default function BusinessesPage() {
  const [town, setTown] = useState('all');
  const [group, setGroup] = useState<'All' | BusinessGroup>('All');
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const inTown = useMemo(
    () =>
      town === 'all'
        ? VISIBLE_BUSINESSES
        : VISIBLE_BUSINESSES.filter((b) => b.town === town),
    [town]
  );

  const businesses = useMemo(() => {
    let list = inTown;
    if (group !== 'All') list = list.filter((b) => getBusinessGroup(b) === group);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(query) || b.category.toLowerCase().includes(query)
    );
  }, [inTown, group, search]);

  // Any filter change starts the list again from the first page.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [town, group, search]);

  const counts = useMemo(() => countByGroup(inTown), [inTown]);
  const availableGroups = BUSINESS_GROUPS.filter((g) => (counts.get(g) ?? 0) > 0);
  const shown = businesses.slice(0, visible);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a2f5c] via-[#1c6cb8] to-[#31a8c9] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">
            Business Directory
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Shops, trades and services across the Garden Route — search by town or
            category, then call or navigate in one tap.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={inTown.length} label="businesses" />
            <Stat value={availableGroups.length} label="categories" />
            <Stat value={countWithLogos(inTown, getBusinessLogo)} label="with logos" />
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
            placeholder="Search a shop, trade or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-card text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <GroupChip
            label="All"
            count={inTown.length}
            active={group === 'All'}
            onClick={() => setGroup('All')}
          />
          {availableGroups.map((g) => (
            <GroupChip
              key={g}
              label={g}
              icon={GROUP_META[g].icon}
              count={counts.get(g) ?? 0}
              active={group === g}
              activeClass={ACCENT_CLASSES[GROUP_META[g].accent].chip}
              onClick={() => setGroup(group === g ? 'All' : g)}
            />
          ))}
        </div>
      </section>

      {/* Results */}
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'}
          {town !== 'all' && ` in ${getTownLabel(town)}`}
        </h2>
        {(group !== 'All' || search) && (
          <button
            type="button"
            onClick={() => {
              setGroup('All');
              setSearch('');
            }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {businesses.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
          <Store className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">No businesses match</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search, another town, or clear the category filter.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shown.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          {visible < businesses.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-md hover:brightness-110 active:scale-95 transition"
              >
                Show more ({businesses.length - visible} left)
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Listings from OpenStreetMap, © OpenStreetMap contributors. Brand logos
        belong to their respective owners.
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

function GroupChip({
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
          active ? 'bg-white/25' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}

function BusinessCard({ business }: { business: Business }) {
  const groupName = getBusinessGroup(business);
  const { accent } = GROUP_META[groupName];
  const classes = ACCENT_CLASSES[accent];
  const logo = getBusinessLogo(business);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className={`absolute left-0 top-0 h-full w-1 ${classes.bar}`} aria-hidden="true" />

      <DirectoryPhoto src={business.image} alt={business.name} />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark src={logo} name={business.name} variant="banner" icon={GROUP_META[groupName].icon} />

        <h3 className="mt-4 font-semibold text-slate-900 leading-snug">{business.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${classes.badge}`}>
            {business.category}
          </span>
          <span className="text-xs text-slate-400">{getTownLabel(business.town)}</span>
        </div>

        {business.phone && (
          <a
            href={`tel:${business.phone.replace(/\s/g, '')}`}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {business.phone}
          </a>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {business.phone && (
            <a
              href={`tel:${business.phone.replace(/\s/g, '')}`}
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call
            </a>
          )}
          <a
            href={getBusinessMapsUrl(business)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-accent" aria-hidden="true" />
            Navigate
          </a>
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_GHOST}
            >
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Website
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${business.name} ${getTownLabel(business.town)}`
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
