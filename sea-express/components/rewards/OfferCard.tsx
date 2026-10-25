import { Store, ArrowRight } from 'lucide-react';
import type { OfferWithBusiness } from '@/lib/rewards/types';

// Each business keeps the same coupon colour every time, picked from its
// name — so a member starts to recognise their regulars at a glance. Full
// class strings, because Tailwind only keeps classes it can see as literals.
const COUPON_COLOURS = [
  'from-[#f6b44b] via-[#ee7d3a] to-[#d9532a]',
  'from-[#ff8f7a] via-[#e5566f] to-[#b8325a]',
  'from-[#4cc3dd] via-[#1c8ec4] to-[#155f9c]',
  'from-[#5fd3b9] via-[#14a38c] to-[#0e6e66]',
  'from-[#a78bfa] via-[#6d5ce8] to-[#3f36b5]',
  'from-[#c3d65a] via-[#7a9a2e] to-[#3f6a24]',
];

function colourFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) | 0;
  return COUPON_COLOURS[Math.abs(h) % COUPON_COLOURS.length];
}

function dealLabel(offer: OfferWithBusiness): { big: string; small: string } {
  const { offer_type, discount_value } = offer;
  if (offer_type === 'percentage_discount' && discount_value != null) return { big: `${discount_value}%`, small: 'off' };
  if (offer_type === 'fixed_discount' && discount_value != null) return { big: `R${discount_value}`, small: 'off' };
  if (offer_type === 'bogo') return { big: '2 for 1', small: 'buy one, get one' };
  if (offer_type === 'free_item') return { big: 'Free', small: 'on us' };
  return { big: 'Deal', small: 'special offer' };
}

// Plain <img>, not next/image: logos come from Supabase storage URLs, and
// the static export has no image optimisation server to proxy them.
export default function OfferCard({ offer }: { offer: OfferWithBusiness }) {
  const deal = dealLabel(offer);

  return (
    <a
      href={`/rewards/offer?id=${offer.id}`}
      className="group block ticket [--notch-y:112px] drop-shadow-[0_14px_22px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* Coupon face */}
      <div className={`relative h-28 overflow-hidden rounded-t-2xl bg-gradient-to-br ${colourFor(offer.business.name)} px-5 py-4 text-white`}>
        <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[34px] font-black leading-none tracking-tight drop-shadow-sm">{deal.big}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">{deal.small}</p>
          </div>
          <span className="flex items-center justify-center w-14 h-14 flex-none rounded-2xl bg-white shadow-md overflow-hidden">
            {offer.business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offer.business.logo_url} alt="" className="max-h-11 max-w-11 object-contain" />
            ) : (
              <Store className="w-6 h-6 text-slate-400" aria-hidden="true" />
            )}
          </span>
        </div>
      </div>

      {/* Stub */}
      <div className="relative rounded-b-2xl bg-card px-5 pt-4 pb-4">
        {/* Perforation along the tear line. */}
        <div
          className="absolute -top-px left-4 right-4 border-t-2 border-dashed border-slate-200"
          aria-hidden="true"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {offer.business.name}
        </p>
        <p className="mt-0.5 font-bold leading-snug text-slate-900">{offer.title}</p>
        <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          Get voucher
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </p>
      </div>
    </a>
  );
}
