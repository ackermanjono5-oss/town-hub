'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, Home, Mail, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Specs } from '@/components/property/LiveListings';
import { getTownLabel } from '@/lib/garden-route/towns';
import { getListing } from '@/lib/property/queries';
import { formatPrice, propertyTypeLabel, type PropertyListing } from '@/lib/property/types';

// Query-string route (?id=) so it can be statically exported, like /rewards/offer.

const ACTION =
  'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition active:scale-95';
const GHOST = `${ACTION} border border-slate-200 text-slate-700 hover:bg-slate-100`;

/** "082 123 4567" → "27821234567" for wa.me links. */
function waDigits(phone: string): string {
  const d = phone.replace(/\D/g, '');
  return d.startsWith('0') ? `27${d.slice(1)}` : d;
}

function ListingDetail() {
  const id = useSearchParams().get('id');
  const [listing, setListing] = useState<PropertyListing | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setListing(null);
      return;
    }
    getListing(id).then(setListing);
  }, [id]);

  if (listing === undefined) {
    return <p className="text-center text-slate-500 py-16">Loading…</p>;
  }
  if (listing === null) {
    return (
      <div className="text-center py-16">
        <Home className="w-10 h-10 mx-auto text-slate-300" aria-hidden="true" />
        <p className="mt-3 font-medium text-slate-700">This listing isn&apos;t available</p>
        <p className="mt-1 text-sm text-slate-500">It may have been taken down, or you&apos;re offline.</p>
        <a href="/property" className={`${ACTION} mt-4 bg-primary text-primary-foreground`}>
          Back to Real Estate
        </a>
      </div>
    );
  }

  const l = listing;
  const town = getTownLabel(l.town);
  const place = [l.suburb, town].filter(Boolean).join(', ');
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, South Africa`)}`;
  const gone = l.is_sold;

  return (
    <>
      <Gallery photos={l.photos} title={l.title} />

      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {l.listing_type === 'rent' ? 'To rent' : 'For sale'}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{propertyTypeLabel(l.property_type)}</span>
        {gone && (
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white uppercase">
            {l.listing_type === 'rent' ? 'Let' : 'Sold'}
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">{formatPrice(l.price, l.listing_type)}</p>
      <h1 className="mt-1 text-xl font-semibold text-slate-800">{l.title}</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="w-4 h-4" aria-hidden="true" />
        {place}
      </p>

      <Specs listing={l} className="mt-4 text-base" />
      {l.floor_size != null && l.erf_size != null && (
        <p className="mt-1 text-sm text-slate-500">
          Floor {l.floor_size} m² · Erf {l.erf_size} m²
        </p>
      )}

      {l.description && (
        <p className="mt-5 whitespace-pre-line break-words text-slate-700 leading-relaxed">{l.description}</p>
      )}

      <section className="mt-6 rounded-2xl bg-card border border-slate-200/70 shadow-md p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Listed by</p>
        <p className="mt-1 font-semibold text-slate-900">{l.agency_name ?? 'Estate agency'}</p>
        {l.agent_name && <p className="text-sm text-slate-600">{l.agent_name}</p>}

        <div className="mt-4 flex flex-wrap gap-2">
          {l.agent_phone && (
            <>
              <a href={`tel:${l.agent_phone.replace(/\s/g, '')}`} className={`${ACTION} bg-primary text-primary-foreground shadow-sm hover:brightness-110`}>
                <Phone className="w-4 h-4" aria-hidden="true" />
                Call
              </a>
              <a
                href={`https://wa.me/${waDigits(l.agent_phone)}?text=${encodeURIComponent(`Hi, I saw "${l.title}" on Town Hub.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={GHOST}
              >
                <MessageCircle className="w-4 h-4 text-green-600" aria-hidden="true" />
                WhatsApp
              </a>
            </>
          )}
          {l.agent_email && (
            <a
              href={`mailto:${l.agent_email}?subject=${encodeURIComponent(l.title)}`}
              className={GHOST}
            >
              <Mail className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Email
            </a>
          )}
          {l.agency_url && (
            <a href={l.agency_url} target="_blank" rel="noopener noreferrer" className={GHOST}>
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              Agency page
            </a>
          )}
          <a href={maps} target="_blank" rel="noopener noreferrer" className={GHOST}>
            <Navigation className="w-4 h-4 text-[#b45309] dark:text-amber-400" aria-hidden="true" />
            Area
          </a>
        </div>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        Posted by the agency and checked by Town Hub. Please confirm the price and details with the
        agent before making any decision or payment.
      </p>
    </>
  );
}

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  function go(i: number) {
    const el = strip.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  }

  if (photos.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-slate-100 flex items-center justify-center">
        <Home className="w-12 h-12 text-slate-300" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-lg">
      <div
        ref={strip}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={`${title}, photo ${i + 1}`}
            className="w-full flex-none snap-center aspect-[4/3] object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(Math.max(0, index - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center disabled:opacity-0 transition"
            disabled={index === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(Math.min(photos.length - 1, index + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center disabled:opacity-0 transition"
            disabled={index === photos.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {photos.map((url, i) => (
              <span
                key={url}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ListingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <a href="/property" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Real Estate
      </a>
      <Suspense fallback={<p className="text-center text-slate-500 py-16">Loading…</p>}>
        <ListingDetail />
      </Suspense>
    </div>
  );
}
