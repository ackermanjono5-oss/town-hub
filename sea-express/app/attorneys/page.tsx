'use client';

import { useMemo, useState } from 'react';
import {
  Scale,
  MapPin,
  Phone,
  Globe,
  Mail,
  Search,
  Navigation,
  BadgeCheck,
  ScrollText,
  ArrowRight,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import BrandMark from '@/components/BrandMark';
import {
  ATTORNEYS,
  countAttorneysByTown,
  getAttorneyMapsUrl,
  getAttorneysByTown,
  getNearestAttorneyTowns,
  type Attorney,
} from '@/lib/garden-route/attorneys';
import { getAttorneyLogo } from '@/lib/garden-route/attorney-logos';
import { logoFirst } from '@/lib/garden-route/display';

/**
 * Brand colour behind logos that are white on transparent, which would
 * otherwise vanish on the card's white tile. Keyed by website host.
 */
const LOGO_BG: Record<string, string> = {
  'haycocklaw.co.za': '#1f2937',
};

function logoBg(website: string | undefined): string | undefined {
  if (!website) return undefined;
  try {
    return LOGO_BG[new URL(website).hostname.replace(/^www\./, '')];
  } catch {
    return undefined;
  }
}

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

const COUNTS = countAttorneysByTown();

/** Opens on the best-covered town so the page never loads empty. */
const DEFAULT_TOWN =
  [...COUNTS.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? TOWNS[0].slug;

export default function AttorneysPage() {
  const [town, setTown] = useState(DEFAULT_TOWN);
  const [service, setService] = useState('All');
  const [search, setSearch] = useState('');

  const townLabel = getTownLabel(town);
  const inTown = useMemo(
    () => logoFirst(getAttorneysByTown(town), (a) => getAttorneyLogo(a.website)),
    [town]
  );

  const services = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of inTown) for (const s of a.services ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [inTown]);

  const attorneys = useMemo(() => {
    let list = inTown;
    if (service !== 'All') list = list.filter((a) => a.services?.includes(service));
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        (a.address ?? '').toLowerCase().includes(query) ||
        (a.services ?? []).some((s) => s.toLowerCase().includes(query))
    );
  }, [inTown, service, search]);

  const nearest = inTown.length === 0 ? getNearestAttorneyTowns(town) : [];

  function pickTown(slug: string) {
    setTown(slug);
    setService('All');
    setSearch('');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#3730a3] to-[#6366f1] text-white shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Attorneys</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Attorneys, conveyancers and notaries across the Garden Route — for wills and
            estates, property transfers, family matters and litigation.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/legal-notices"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-indigo-900 font-semibold shadow-lg shadow-black/20 hover:bg-indigo-50 active:scale-95 transition"
            >
              <ScrollText className="w-5 h-5" aria-hidden="true" />
              Legal Notices
            </a>
            <span className="inline-flex items-baseline gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
              <strong className="text-base font-bold">{ATTORNEYS.length}</strong>
              <span className="text-white/75">firms</span>
            </span>
            <span className="inline-flex items-baseline gap-1.5 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
              <strong className="text-base font-bold">{COUNTS.size}</strong>
              <span className="text-white/75">towns</span>
            </span>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white/85 backdrop-blur border border-white/60 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Town
        </p>
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
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100',
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
              placeholder={`Search attorneys in ${townLabel}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {services.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-4 mb-2">
              Service
            </p>
            <div className="flex flex-wrap gap-2">
              {[['All', inTown.length] as const, ...services].map(([label, n]) => {
                const active = service === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setService(active && label !== 'All' ? 'All' : label)}
                    aria-pressed={active}
                    className={[
                      'inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-sm font-medium border transition active:scale-95',
                      active
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {label}
                    <span
                      className={[
                        'ml-0.5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold',
                        active ? 'bg-white/25' : 'bg-slate-100 text-slate-500',
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

      {inTown.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white/80 border border-white/60 p-8 text-center shadow">
          <Scale className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-3 font-medium text-slate-700">
            No attorneys listed in {townLabel} yet
          </p>
          {nearest.length > 0 && (
            <>
              <p className="mt-1 text-sm text-slate-500">
                The nearest attorneys are in{' '}
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
              {attorneys.length} {attorneys.length === 1 ? 'firm' : 'firms'} in {townLabel}
            </h2>
          </div>

          {attorneys.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white/80 border border-white/60 p-8 text-center shadow">
              <p className="font-medium text-slate-700">No matches</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search or clear the service filter.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {attorneys.map((a) => (
                <AttorneyCard key={a.id} attorney={a} townLabel={townLabel} />
              ))}
            </div>
          )}
        </>
      )}

      <p className="mt-8 text-center text-xs text-slate-500">
        Every firm listed <BadgeCheck className="inline w-3.5 h-3.5 -mt-0.5" /> was
        checked against its own website, and its logo comes from that site. Contact
        details are from the southafricanlawyer.co.za directory — please confirm with
        the firm. Attorney or firm not listed, or details out of date? Email{' '}
        <a href="mailto:info@seaexpress.co.za" className="underline">
          info@seaexpress.co.za
        </a>
        .
      </p>
    </div>
  );
}

function AttorneyCard({ attorney, townLabel }: { attorney: Attorney; townLabel: string }) {
  const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`;
  const logo = getAttorneyLogo(attorney.website);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-500" aria-hidden="true" />

      <div className="p-5 pl-6 flex flex-col flex-1">
        <BrandMark
          src={logo}
          name={attorney.name}
          variant="banner"
          icon={Scale}
          bg={logoBg(attorney.website)}
        />

        <div className="mt-4 flex items-start gap-1.5">
          <h3 className="font-semibold text-slate-900 leading-snug">{attorney.name}</h3>
          {attorney.verified && (
            <BadgeCheck
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-600"
              aria-label="Checked against the firm's own website"
            />
          )}
        </div>

        {attorney.services && attorney.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attorney.services.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {attorney.address && (
          <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
            <span>{attorney.address}</span>
          </p>
        )}

        {attorney.phone && (
          <a
            href={tel(attorney.phone)}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            {attorney.phone}
          </a>
        )}

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          {attorney.phone && (
            <a
              href={tel(attorney.phone)}
              className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Call
            </a>
          )}
          <a
            href={getAttorneyMapsUrl(attorney, townLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Navigation className="w-4 h-4 text-accent" aria-hidden="true" />
            Navigate
          </a>
          {attorney.email && (
            <a href={`mailto:${attorney.email}`} className={ACTION_GHOST}>
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Email
            </a>
          )}
          {attorney.website && (
            <a
              href={attorney.website}
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
