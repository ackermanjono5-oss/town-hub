'use client';

import { useMemo, useState } from 'react';
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Search,
  Siren,
  MessageCircle,
  Mail,
  Navigation,
  Clock,
  BadgeCheck,
  Building2,
  Pill,
  Stethoscope,
  Smile,
  Eye,
  HeartPulse,
  Ear,
  FlaskConical,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import DirectoryPhoto from '@/components/DirectoryPhoto';
import BrandMark from '@/components/BrandMark';
import {
  ACTIVE_CATEGORIES,
  countByCategory,
  getMedicalByTown,
  getGoogleMapsUrl,
  getWhatsAppUrl,
  type MedicalCategory,
  type MedicalFacility,
} from '@/lib/garden-route/medical';

/**
 * Per-category icon and accent colour. Everything visual about a category
 * comes from here so a card, a chip and a count badge can never drift apart.
 * `accent` is a Tailwind colour family name used to build the class strings
 * below — kept as a literal union so a typo is a type error.
 */
type Accent = 'rose' | 'emerald' | 'sky' | 'violet' | 'amber' | 'teal' | 'slate';

const CATEGORY_META: Record<string, { icon: LucideIcon; accent: Accent }> = {
  Hospital: { icon: Building2, accent: 'rose' },
  Pharmacy: { icon: Pill, accent: 'emerald' },
  Chemist: { icon: Pill, accent: 'emerald' },
  Doctor: { icon: Stethoscope, accent: 'sky' },
  Clinic: { icon: HeartPulse, accent: 'amber' },
  Dentist: { icon: Smile, accent: 'teal' },
  Optometrist: { icon: Eye, accent: 'violet' },
  Audiologist: { icon: Ear, accent: 'violet' },
  Laboratory: { icon: FlaskConical, accent: 'slate' },
  Physiotherapist: { icon: Activity, accent: 'teal' },
  Rehabilitation: { icon: Activity, accent: 'teal' },
};

const DEFAULT_META = { icon: HeartPulse, accent: 'slate' as Accent };

// Full class strings, because Tailwind only keeps classes it can see as
// literals — `bg-${accent}-100` would be purged.
const ACCENT_CLASSES: Record<Accent, { badge: string; chip: string; bar: string }> = {
  rose: {
    badge: 'bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300',
    chip: 'bg-rose-600 text-white border-rose-600',
    bar: 'bg-rose-500',
  },
  emerald: {
    badge: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300',
    chip: 'bg-emerald-600 text-white border-emerald-600',
    bar: 'bg-emerald-500',
  },
  sky: {
    badge: 'bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300',
    chip: 'bg-sky-600 text-white border-sky-600',
    bar: 'bg-sky-500',
  },
  violet: {
    badge: 'bg-violet-100 dark:bg-violet-400/15 text-violet-700 dark:text-violet-300',
    chip: 'bg-violet-600 text-white border-violet-600',
    bar: 'bg-violet-500',
  },
  amber: {
    badge: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300',
    chip: 'bg-amber-600 text-white border-amber-600',
    bar: 'bg-amber-500',
  },
  teal: {
    badge: 'bg-teal-100 dark:bg-teal-400/15 text-teal-700 dark:text-teal-300',
    chip: 'bg-teal-600 text-white border-teal-600',
    bar: 'bg-teal-500',
  },
  slate: {
    badge: 'bg-slate-200 text-slate-700',
    chip: 'bg-[#334155] dark:bg-[#3e5a78] text-white border-[#334155] dark:border-[#3e5a78]',
    bar: 'bg-[#64748b]',
  },
};

function metaFor(category: MedicalCategory) {
  return CATEGORY_META[category] ?? DEFAULT_META;
}

function getGoogleReviewsUrl(facility: MedicalFacility, townLabel: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${facility.name} ${townLabel} reviews`)}`;
}

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

/**
 * The gazetteer runs west to east, so TOWNS[0] is Witsand — a town with no
 * listed facilities. Opening on the best-covered town instead means the page
 * never loads empty.
 */
const DEFAULT_TOWN =
  [...TOWNS]
    .map((t) => ({ slug: t.slug, n: getMedicalByTown(t.slug).length }))
    .sort((a, b) => b.n - a.n)[0]?.slug ?? TOWNS[0].slug;

export default function MedicalPage() {
  const [town, setTown] = useState(DEFAULT_TOWN);
  const [category, setCategory] = useState<'All' | MedicalCategory>('All');
  const [search, setSearch] = useState('');

  const townLabel = getTownLabel(town);
  const inTown = useMemo(() => getMedicalByTown(town), [town]);
  const counts = useMemo(() => countByCategory(town), [town]);

  const facilities = useMemo(() => {
    let list = inTown;
    if (category !== 'All') list = list.filter((m) => m.category === category);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query) ||
        (m.address ?? '').toLowerCase().includes(query)
    );
  }, [inTown, category, search]);

  const hospitalCount = counts.get('Hospital') ?? 0;
  const pharmacyCount = (counts.get('Pharmacy') ?? 0) + (counts.get('Chemist') ?? 0);
  const availableCategories = ACTIVE_CATEGORIES.filter((c) => (counts.get(c) ?? 0) > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6b1235] via-[#d4416a] to-[#ff8f7a] text-white shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/15 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">
            Medical Directory
          </h1>
          <p className="mt-3 max-w-xl text-white/80">
            Hospitals, pharmacies, doctors, dentists and optometrists across the
            Garden Route — with directions, opening hours and one-tap contact.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/sos"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-danger text-danger-foreground font-semibold shadow-lg shadow-black/20 hover:brightness-110 active:scale-95 transition"
            >
              <Siren className="w-5 h-5" aria-hidden="true" />
              Emergency SOS
            </a>
            <div className="flex flex-wrap gap-2">
              <Stat value={inTown.length} label="listings" />
              <Stat value={hospitalCount} label="hospitals" />
              <Stat value={pharmacyCount} label="pharmacies" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Filters                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section className="mt-6 rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Town
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {TOWNS.map((t) => {
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
            placeholder={`Search in ${townLabel}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-card text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
              {availableCategories.map((c) => {
                const { icon: Icon, accent } = metaFor(c);
                return (
                  <CategoryChip
                    key={c}
                    label={c}
                    icon={Icon}
                    count={counts.get(c) ?? 0}
                    active={category === c}
                    activeClass={ACCENT_CLASSES[accent].chip}
                    onClick={() => setCategory(category === c ? 'All' : c)}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Results                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {facilities.length} {facilities.length === 1 ? 'result' : 'results'} in{' '}
          {townLabel}
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

      {facilities.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
          <HeartPulse className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">
            {inTown.length === 0
              ? `Nothing listed in ${townLabel} yet`
              : 'No matches'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {inTown.length === 0
              ? 'Try a nearby town — George and Knysna have the closest hospitals.'
              : 'Try a different search or clear the category filter.'}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              townLabel={townLabel}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Listings marked <BadgeCheck className="inline w-3.5 h-3.5 -mt-0.5" /> were
        checked against the operator&apos;s own website. Other listings come from
        OpenStreetMap, © OpenStreetMap contributors.
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

function FacilityCard({
  facility,
  townLabel,
}: {
  facility: MedicalFacility;
  townLabel: string;
}) {
  const { icon: Icon, accent } = metaFor(facility.category);
  const classes = ACCENT_CLASSES[accent];
  const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`;

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      {/* Category accent strip — instant visual grouping in a long list. */}
      <span className={`absolute left-0 top-0 h-full w-1 ${classes.bar}`} aria-hidden="true" />

      <DirectoryPhoto src={facility.image} alt={facility.name} />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark src={facility.logo} name={facility.name} variant="banner" icon={Icon} />

        <div className="mt-4 flex items-start gap-1.5">
          <h3 className="font-semibold text-slate-900 leading-snug">{facility.name}</h3>
          {facility.verified && (
            <BadgeCheck
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-600 dark:text-sky-400"
              aria-label="Details verified against the operator's website"
            />
          )}
        </div>
        {/* self-start so the pill hugs its text: the card body is a flex
            column, whose children stretch to full width by default. */}
        <span
          className={`mt-1.5 self-start inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${classes.badge}`}
        >
          <Icon className="w-3 h-3" aria-hidden="true" />
          {facility.category}
        </span>


        {facility.address && (
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <span>{facility.address}</span>
          </p>
        )}

        {facility.hours && facility.hours.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-sm">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <dl className="space-y-0.5">
              {facility.hours.map((h) => (
                <div key={`${h.days}-${h.time}`} className="flex flex-wrap gap-x-2">
                  <dt className="text-slate-500 min-w-[7.5rem]">{h.days}</dt>
                  <dd className="font-medium text-slate-800">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {(facility.phone || facility.phoneAlt) && (
          <div className="mt-3 space-y-1">
            {[facility.phone, facility.phoneAlt].filter(Boolean).map((n) => (
              <a
                key={n}
                href={tel(n as string)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {n}
              </a>
            ))}
          </div>
        )}

        {/* Actions pinned to the bottom so cards in a row line up. */}
        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {facility.phone && (
            <a
              href={tel(facility.phone)}
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call
            </a>
          )}
          {facility.whatsapp && (
            <a
              href={getWhatsAppUrl(facility.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ACTION} bg-emerald-600 text-white shadow-sm hover:brightness-110`}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              WhatsApp
            </a>
          )}
          <a
            href={getGoogleMapsUrl(facility)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-accent" aria-hidden="true" />
            Navigate
          </a>
          {facility.email && (
            <a href={`mailto:${facility.email}`} className={ACTION_GHOST}>
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Email
            </a>
          )}
          {facility.website && (
            <a
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className={ACTION_GHOST}
            >
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Website
            </a>
          )}
          <a
            href={getGoogleReviewsUrl(facility, townLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
            Reviews
          </a>
        </div>

        {facility.emergencyPhone && (
          <a
            href={tel(facility.emergencyPhone)}
            className="mt-3 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-danger text-danger-foreground text-sm font-semibold shadow-sm hover:brightness-110 active:scale-95 transition"
          >
            <Siren className="w-4 h-4" aria-hidden="true" />
            {facility.emergencyLabel ?? 'Emergency'} · {facility.emergencyPhone}
          </a>
        )}
      </div>
    </article>
  );
}
