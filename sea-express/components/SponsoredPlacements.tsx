import { BadgeCheck } from 'lucide-react';
import { getTownLabel } from '@/lib/garden-route/towns';
import { bannersForTown, listingsForTown } from '@/lib/garden-route/sponsored';
import { appHref } from '@/lib/app-nav';
import AdActions from '@/components/AdActions';

/**
 * Paid placements for the selected town in the Business Directory: the
 * town's banners, then its featured listings, above the normal results.
 * Renders nothing for towns without any.
 */
export default function SponsoredPlacements({ town }: { town: string }) {
  const banners = bannersForTown(town);
  const listings = listingsForTown(town);
  if (banners.length === 0 && listings.length === 0) return null;

  return (
    <section className="mt-4 space-y-4" aria-label={`Featured in ${getTownLabel(town)}`}>
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-card/90 shadow-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={appHref(banner.image)}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            className="block h-auto w-full"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Sponsored · {banner.name}
            </span>
            <AdActions actions={banner.actions} />
          </div>
        </div>
      ))}

      {listings.map((listing) => (
        <article
          key={listing.id}
          className="rounded-2xl border border-amber-300/70 dark:border-amber-400/30 bg-card shadow-md p-4 sm:p-5"
        >
          <div className="flex gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={appHref(listing.logo)}
              alt=""
              className="h-16 w-24 flex-none rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200 sm:h-20 sm:w-28"
            />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Featured
              </p>
              <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900">{listing.name}</h3>
              <p className="text-sm text-slate-500">
                {listing.category} · {getTownLabel(listing.town)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{listing.description}</p>
          <AdActions actions={listing.actions} className="mt-3" />
        </article>
      ))}
    </section>
  );
}
