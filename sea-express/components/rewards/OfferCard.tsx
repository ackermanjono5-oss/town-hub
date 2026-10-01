import { Store } from 'lucide-react';
import type { OfferWithBusiness } from '@/lib/rewards/types';

// Plain <img>, not next/image: no next.config.* exists in this repo (a
// pre-existing gap, out of scope here), so next/image has no remote
// domain allowlist for business logo URLs coming from Supabase.
function DiscountBadge({ offer }: { offer: OfferWithBusiness }) {
  const { offer_type, discount_value } = offer;
  let label = 'Special offer';
  if (offer_type === 'percentage_discount' && discount_value != null) {
    label = `${discount_value}% off`;
  } else if (offer_type === 'fixed_discount' && discount_value != null) {
    label = `R${discount_value} off`;
  } else if (offer_type === 'bogo') {
    label = 'Buy One Get One';
  } else if (offer_type === 'free_item') {
    label = 'Free item';
  }
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
      {label}
    </span>
  );
}

export default function OfferCard({ offer }: { offer: OfferWithBusiness }) {
  return (
    <a
      href={`/rewards/offer?id=${offer.id}`}
      className="flex flex-col rounded-xl border border-border overflow-hidden bg-background hover:border-primary hover:shadow-lg card-lift"
    >
      <div className="relative w-full h-24 flex items-center justify-center bg-secondary">
        {offer.business.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.business.logo_url}
            alt={offer.business.name}
            className="max-h-16 max-w-[80%] object-contain"
          />
        ) : (
          <Store className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground leading-tight">
          {offer.business.name}
        </p>
        <p className="text-sm font-semibold leading-tight">{offer.title}</p>
        <DiscountBadge offer={offer} />
      </div>
    </a>
  );
}
