'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, Globe, MapPin, Search, Home } from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import {
  ESTATE_AGENCIES,
  getAgencyOfficesUrl,
  type EstateAgency,
} from '@/lib/garden-route/estate-agencies';

const ACTION =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95';
const ACTION_GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

export default function PropertyPage() {
  const [town, setTown] = useState('all');
  const townLabel = town === 'all' ? undefined : getTownLabel(town);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f3d5e] via-[#1f6f8b] to-[#7fc8d8] text-white shadow-xl">
        <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-cyan-300/20 blur-2xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Garden Route
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Real Estate</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Estate agencies selling and letting property from Mossel Bay to
            Plettenberg Bay. Browse an agency&apos;s current listings on their own
            site, or find their nearest office.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Stat value={ESTATE_AGENCIES.length} label="agencies" />
            <Stat value={TOWNS.length} label="towns covered" />
          </div>
        </div>
      </section>

      {/* Town picker */}
      <section className="mt-6 rounded-2xl bg-white/85 backdrop-blur border border-white/60 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Find offices in
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {[{ slug: 'all', label: 'Whole Garden Route' }, ...TOWNS].map((t) => {
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
        <p className="mt-3 text-xs text-slate-500">
          Offices vary by franchise, so the Offices button opens a map search
          for that agency in {townLabel ?? 'the Garden Route'}.
        </p>
      </section>

      {/* Agencies */}
      <h2 className="mt-6 text-xl sm:text-2xl font-bold text-slate-900">
        {ESTATE_AGENCIES.length} agencies
      </h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ESTATE_AGENCIES.map((agency) => (
          <AgencyCard key={agency.id} agency={agency} townLabel={townLabel} />
        ))}
      </div>

      {/* Searching for a home */}
      <section className="mt-8 rounded-2xl bg-white/85 backdrop-blur border border-white/60 shadow-lg p-6 text-center">
        <Home className="w-8 h-8 mx-auto text-primary" aria-hidden="true" />
        <p className="mt-3 font-semibold text-slate-800">Looking for a specific property?</p>
        <p className="mt-1 text-sm text-slate-600 max-w-lg mx-auto">
          Listings change daily, so Town Hub links you straight to each agency
          rather than showing stock that may already be sold.
        </p>
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(
            `property for sale ${townLabel ?? 'Garden Route'} South Africa`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ACTION} mt-4 bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Search property in {townLabel ?? 'the Garden Route'}
        </a>
      </section>
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

function AgencyCard({
  agency,
  townLabel,
}: {
  agency: EstateAgency;
  townLabel?: string;
}) {
  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift">
      <span className="absolute left-0 top-0 h-full w-1 bg-primary" aria-hidden="true" />

      <div className="p-5 pl-6 flex flex-col flex-1">
        {/* The logo gets a generous banner rather than an avatar tile — these
            are wide wordmarks, and several need their own brand colour behind
            them because the asset is white-on-transparent. */}
        <div
          className="relative w-full h-20 rounded-xl overflow-hidden flex items-center justify-center px-4 ring-1 ring-slate-200/70"
          style={{ backgroundColor: agency.logoBg ?? '#ffffff' }}
        >
          <Image
            src={agency.logo}
            alt={`${agency.name} logo`}
            fill
            sizes="(min-width: 1024px) 22rem, 100vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900 leading-snug">{agency.name}</h3>
        <p className="mt-1 text-sm text-slate-600">{agency.tagline}</p>

        <div className="mt-auto pt-4 flex flex-wrap gap-2">
          <a
            href={agency.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            View listings
          </a>
          <a
            href={getAgencyOfficesUrl(agency, townLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
            Offices
          </a>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              `${agency.name} ${townLabel ?? 'Garden Route'} property for sale`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={ACTION_GHOST}
          >
            <Building2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
            Listings near me
          </a>
        </div>
      </div>
    </article>
  );
}
