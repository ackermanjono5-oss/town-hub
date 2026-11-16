'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Globe,
  Home,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import BrandMark from '@/components/BrandMark';
import LiveListings from '@/components/property/LiveListings';
import { logoFirst } from '@/lib/garden-route/display';
import {
  ESTATE_OFFICES,
  countOfficesByTown,
  getNearestOfficeTowns,
  getOfficeAgency,
  getOfficeBrand,
  getOfficeMapsUrl,
  getOfficesByTown,
  getOfficeWebsite,
  type EstateOffice,
} from '@/lib/garden-route/estate-offices';

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

const COUNTS = countOfficesByTown();

/** Opens on the best-covered town so the page never loads empty. */
const DEFAULT_TOWN =
  [...COUNTS.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? TOWNS[0].slug;

const logoOf = (o: EstateOffice) => getOfficeAgency(o)?.logo;

export default function PropertyPage() {
  const [town, setTown] = useState(DEFAULT_TOWN);
  const [agency, setAgency] = useState('All');
  const [search, setSearch] = useState('');

  const townLabel = getTownLabel(town);
  const inTown = useMemo(() => logoFirst(getOfficesByTown(town), logoOf), [town]);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of inTown) counts.set(getOfficeBrand(o), (counts.get(getOfficeBrand(o)) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [inTown]);

  const offices = useMemo(() => {
    let list = inTown;
    if (agency !== 'All') list = list.filter((o) => getOfficeBrand(o) === agency);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (o) =>
        o.name.toLowerCase().includes(query) ||
        (o.address ?? '').toLowerCase().includes(query) ||
        getOfficeBrand(o).toLowerCase().includes(query)
    );
  }, [inTown, agency, search]);

  const nearest = inTown.length === 0 ? getNearestOfficeTowns(town) : [];

  function pickTown(slug: string) {
    setTown(slug);
    setAgency('All');
    setSearch('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f3d5e] via-[#1f6f8b] to-[#7fc8d8] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Real Estate</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Homes for sale and to rent, posted by local agencies, plus every estate agency office
            in each Garden Route town. Call an agent, get directions, or browse their listings.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-baseline gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
              <strong className="text-base font-bold">{ESTATE_OFFICES.length}</strong>
              <span className="text-white/75">offices</span>
            </span>
            <span className="inline-flex items-baseline gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
              <strong className="text-base font-bold">{COUNTS.size}</strong>
              <span className="text-white/75">towns</span>
            </span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Town</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {TOWNS.map((t) => {
            const active = t.slug === town;
            const n = COUNTS.get(t.slug) ?? 0;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => pickTown(t.slug)}
                aria-pressed={active}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition active:scale-95',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : n > 0
                      ? 'bg-card text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-card text-slate-500 border-slate-200 hover:bg-slate-100',
                ].join(' ')}
              >
                {t.label}
                {n > 0 && <span className="ml-1.5 text-[11px] opacity-70">{n}</span>}
              </button>
            );
          })}
        </div>

        {inTown.length > 0 && (
          <div className="relative mt-4">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder={`Search agencies in ${townLabel}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-card text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {brands.length > 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
              Agency
            </p>
            <div className="flex flex-wrap gap-2">
              {[['All', inTown.length] as const, ...brands].map(([label, n]) => {
                const active = agency === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAgency(active && label !== 'All' ? 'All' : label)}
                    aria-pressed={active}
                    className={[
                      'inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium border transition active:scale-95',
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {label}
                    <span
                      className={[
                        'ml-0.5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold',
                        active ? 'bg-black/20' : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      <LiveListings town={town} />

      {inTown.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
          <Building2 className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">No estate agencies listed in {townLabel} yet</p>
          {nearest.length > 0 && (
            <>
              <p className="mt-1 text-sm text-slate-500">
                The nearest agencies are in{' '}
                {nearest.map((n, i) => (
                  <span key={n.slug}>
                    {i > 0 && ' and '}
                    <strong className="text-slate-700">{n.label}</strong> ({n.km} km)
                  </span>
                ))}
                .
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {nearest.map((n) => (
                  <button
                    key={n.slug}
                    type="button"
                    onClick={() => pickTown(n.slug)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:brightness-110 active:scale-95 transition"
                  >
                    {n.count} in {n.label}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-baseline justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {offices.length} {offices.length === 1 ? 'agency' : 'agencies'} in {townLabel}
            </h2>
          </div>

          {offices.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
              <p className="font-medium text-slate-700">No matches</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search or clear the agency filter.</p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {offices.map((o) => (
                <OfficeCard key={o.id} office={o} townLabel={townLabel} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Searching for a home */}
      <section className="mt-8 rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-6 text-center">
        <Home className="w-8 h-8 mx-auto text-primary" aria-hidden="true" />
        <p className="mt-3 font-semibold text-slate-800">Looking for a specific property?</p>
        <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">
          Agencies add their own listings to Town Hub, and each agency&apos;s website has the
          rest of its stock. Estate agent?{' '}
          <a href="/business/property" className="underline">
            Add your listings
          </a>
          .
        </p>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(
            `property for sale ${townLabel} South Africa`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ACTION} mt-4 bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Search property in {townLabel}
        </a>
      </section>

      <p className="mt-8 text-center text-xs text-slate-500">
        Offices marked <BadgeCheck className="inline w-3.5 h-3.5 -mt-0.5" /> were checked on the
        agency&apos;s own website. Others are from OpenStreetMap (© OpenStreetMap contributors);
        please confirm details with the agency. Agency not listed, or details out of date? Email{' '}
        <a href="mailto:info@seaexpress.co.za" className="underline">
          info@seaexpress.co.za
        </a>
        .
      </p>
    </div>
  );
}

function OfficeCard({ office, townLabel }: { office: EstateOffice; townLabel: string }) {
  const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`;
  const brand = getOfficeAgency(office);
  const website = getOfficeWebsite(office);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className="absolute left-0 top-0 h-full w-1 bg-[#1f6f8b]" aria-hidden="true" />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark src={brand?.logo} name={office.name} variant="banner" icon={Building2} bg={brand?.logoBg} />

        <div className="mt-4 flex items-start gap-1.5">
          <h3 className="font-semibold text-slate-900 leading-snug">{office.name}</h3>
          {office.verified && (
            <BadgeCheck
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1f6f8b] dark:text-cyan-300"
              aria-label="Checked on the agency's own website"
            />
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{brand ? brand.tagline : 'Independent agency'}</p>

        {office.address && (
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <span>{office.address}</span>
          </p>
        )}

        {office.phone && (
          <a
            href={tel(office.phone)}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {office.phone}
          </a>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {office.phone && (
            <a
              href={tel(office.phone)}
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call
            </a>
          )}
          <a
            href={getOfficeMapsUrl(office, townLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-[#b45309] dark:text-amber-400" aria-hidden="true" />
            Navigate
          </a>
          {office.email && (
            <a href={`mailto:${office.email}`} className={ACTION_GHOST}>
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Email
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className={ACTION_GHOST}>
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              {brand ? 'Listings' : 'Website'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
