'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bath, BedDouble, Camera, Car, Home, Ruler } from 'lucide-react';
import { appHref } from '@/lib/app-nav';
import { getTownLabel } from '@/lib/garden-route/towns';
import { listLiveListings } from '@/lib/property/queries';
import {
  PROPERTY_TYPES,
  formatPrice,
  propertyTypeLabel,
  type ListingType,
  type PropertyListing,
  type PropertyType,
} from '@/lib/property/types';

type Deal = 'all' | ListingType;

const CHIP = 'px-3 py-1.5 rounded-full text-sm font-medium border transition active:scale-95';
const CHIP_ON = 'bg-primary text-primary-foreground border-primary shadow-sm';
const CHIP_OFF = 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100';

/** Listings agencies posted through the Business Portal, shown above the office directory. */
export default function LiveListings({ town }: { town: string }) {
  const [all, setAll] = useState<PropertyListing[] | null>(null);
  const [deal, setDeal] = useState<Deal>('all');
  const [type, setType] = useState<'all' | PropertyType>('all');
  const [minBeds, setMinBeds] = useState(0);
  const [everywhere, setEverywhere] = useState(false);

  useEffect(() => {
    let live = true;
    listLiveListings().then(({ listings }) => {
      if (live) setAll(listings);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => setEverywhere(false), [town]);

  const inTown = useMemo(() => (all ?? []).filter((l) => l.town === town), [all, town]);
  const pool = useMemo(() => (everywhere ? all ?? [] : inTown), [everywhere, all, inTown]);

  const shown = useMemo(
    () =>
      pool.filter(
        (l) =>
          (deal === 'all' || l.listing_type === deal) &&
          (type === 'all' || l.property_type === type) &&
          (minBeds === 0 || (l.bedrooms ?? 0) >= minBeds)
      ),
    [pool, deal, type, minBeds]
  );

  // Nothing posted yet anywhere (or the feature isn't switched on in the database): invite agencies instead.
  if (all === null) return null;
  if (all.length === 0) return <AgentInvite />;

  const townLabel = getTownLabel(town);
  const others = all.length - inTown.length;

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          {everywhere ? 'Listings in all towns' : `Listings in ${townLabel}`}
        </h2>
        {others > 0 && (
          <button
            type="button"
            onClick={() => setEverywhere(!everywhere)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {everywhere ? `Only ${townLabel}` : `See all towns (${all.length})`}
          </button>
        )}
      </div>

      {pool.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(
            [
              ['all', 'All'],
              ['sale', 'For sale'],
              ['rent', 'To rent'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={deal === value}
              onClick={() => setDeal(value)}
              className={`${CHIP} ${deal === value ? CHIP_ON : CHIP_OFF}`}
            >
              {label}
            </button>
          ))}
          <select
            aria-label="Property type"
            value={type}
            onChange={(e) => setType(e.target.value as 'all' | PropertyType)}
            className="px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-card text-slate-700"
          >
            <option value="all">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Bedrooms"
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="px-3 py-1.5 rounded-full text-sm border border-slate-200 bg-card text-slate-700"
          >
            <option value={0}>Any beds</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ beds
              </option>
            ))}
          </select>
        </div>
      )}

      {pool.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-6 text-center shadow">
          <p className="font-medium text-slate-700">No listings in {townLabel} yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Agencies below can tell you what&apos;s available, or see the listings in other towns.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-6 text-center shadow">
          <p className="font-medium text-slate-700">No listings match</p>
          <p className="mt-1 text-sm text-slate-500">Try fewer filters.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((l) => (
            <ListingCard key={l.id} listing={l} showTown={everywhere} />
          ))}
        </div>
      )}
    </section>
  );
}

function ListingCard({ listing: l, showTown }: { listing: PropertyListing; showTown: boolean }) {
  const cover = l.photos[0];
  const gone = l.is_sold;
  return (
    <a
      href={`/property/listing?id=${l.id}`}
      className="group flex flex-col rounded-2xl bg-card shadow-md hover:shadow-xl border border-slate-200/70 overflow-hidden card-lift"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={appHref(cover)}
            alt=""
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover ${gone ? 'grayscale-[60%]' : ''}`}
          />
        ) : (
          <Home className="absolute inset-0 m-auto w-10 h-10 text-slate-300" aria-hidden="true" />
        )}
        <span className="absolute left-2 top-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 text-white">
          {l.listing_type === 'rent' ? 'To rent' : 'For sale'}
        </span>
        {gone && (
          <span className="absolute right-2 top-2 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-red-600 text-white">
            {l.listing_type === 'rent' ? 'Let' : 'Sold'}
          </span>
        )}
        {l.photos.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-black/60 text-white">
            <Camera className="w-3 h-3" aria-hidden="true" />
            {l.photos.length}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-lg font-bold text-slate-900">{formatPrice(l.price, l.listing_type)}</p>
        <p className="mt-0.5 font-medium text-slate-800 leading-snug line-clamp-2">{l.title}</p>
        <p className="mt-1 text-sm text-slate-500">
          {propertyTypeLabel(l.property_type)} · {[l.suburb, showTown ? getTownLabel(l.town) : null].filter(Boolean).join(', ') || getTownLabel(l.town)}
        </p>
        <Specs listing={l} className="mt-3" />
        {l.agency_name && <p className="mt-auto pt-3 text-xs text-slate-500">{l.agency_name}</p>}
      </div>
    </a>
  );
}

export function Specs({ listing: l, className = '' }: { listing: PropertyListing; className?: string }) {
  const items = [
    l.bedrooms != null && { icon: BedDouble, text: `${l.bedrooms} bed` },
    l.bathrooms != null && { icon: Bath, text: `${l.bathrooms} bath` },
    l.garages != null && l.garages > 0 && { icon: Car, text: `${l.garages} garage` },
    (l.floor_size ?? l.erf_size) != null && {
      icon: Ruler,
      text: `${l.floor_size ?? l.erf_size} m²`,
    },
  ].filter(Boolean) as { icon: typeof Bath; text: string }[];
  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600 ${className}`}>
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="inline-flex items-center gap-1">
          <Icon className="w-4 h-4 text-slate-400" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}

function AgentInvite() {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-card/70 p-5 text-center">
      <p className="font-semibold text-slate-800">Estate agents: list your properties on Town Hub</p>
      <p className="mt-1 text-sm text-slate-500 max-w-lg mx-auto">
        Register your agency in the Business Portal, then add listings with photos, price and
        details. Town Hub checks each one before it goes live.
      </p>
      <a
        href="/business/property"
        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:brightness-110"
      >
        Add a listing
      </a>
    </section>
  );
}
