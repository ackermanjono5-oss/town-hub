'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Store } from 'lucide-react';
import RewardsGate from '@/components/rewards/RewardsGate';
import QRDisplay from '@/components/rewards/QRDisplay';
import { getOfferById, redeemOffer } from '@/lib/rewards/queries';
import { DEMO_MODE, DEMO_TOKEN_TTL_MS, demoQrPayload, getDemoOffer } from '@/lib/rewards/demo';
import { RedeemOfferError, type OfferWithBusiness, type RedeemOfferResponse } from '@/lib/rewards/types';

// Query-string route (?id=), not a [offerId] dynamic segment. The app is
// built with output: 'export' (next.config.js) and bundled into the
// Android WebView, and a dynamic segment can't be statically exported
// without listing every offer ID at build time — which would make
// newly-added offers unreachable until a rebuild. This route is a plain
// static HTML file with all data fetched client-side instead.

function redeemErrorMessage(error: RedeemOfferError): string {
  switch (error.code) {
    case 'ALREADY_REDEEMED':
      return "You've used this reward the maximum number of times this month. Check back next month!";
    case 'NOT_SUBSCRIBED':
      return 'Become a Town Hub member to redeem rewards.';
    case 'PROFILE_INCOMPLETE':
      return 'Add your name and phone number to your profile to redeem rewards.';
    case 'OFFER_UNAVAILABLE':
      return 'This offer is no longer available.';
    case 'UNAUTHENTICATED':
      return 'Please sign in again to redeem this offer.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function OfferDetail() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('id');
  // Extra coupon detail (code, validity, phone) that only demo builds carry.
  const demoDetails = DEMO_MODE && offerId ? getDemoOffer(offerId) : null;

  const [offer, setOffer] = useState<OfferWithBusiness | null | undefined>(undefined);
  const [redemption, setRedemption] = useState<RedeemOfferResponse | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (!offerId) {
      setOffer(null);
      return;
    }
    if (DEMO_MODE) {
      setOffer(getDemoOffer(offerId));
      return;
    }
    getOfferById(offerId).then(setOffer);
  }, [offerId]);

  async function handleRedeem() {
    if (!offerId) return;
    setRedeeming(true);
    setRedeemError(null);

    // Demo builds have no redeem-offer Edge Function to call, so the
    // token is generated locally just to drive the QR screen.
    const demoOffer = DEMO_MODE ? getDemoOffer(offerId) : null;
    if (demoOffer) {
      const now = Date.now();
      setRedemption({
        tokenId: `demo-${demoOffer.coupon_code}`,
        // Demo vouchers show their printed coupon code via couponCode instead.
        code: '',
        qrToken: demoQrPayload(demoOffer),
        status: 'available',
        period: `${new Date().toISOString().slice(0, 7)}-01`,
        issuedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + DEMO_TOKEN_TTL_MS).toISOString(),
      });
      setRedeeming(false);
      return;
    }

    try {
      const result = await redeemOffer(offerId);
      setRedemption(result);
    } catch (err) {
      setRedeemError(err instanceof RedeemOfferError ? redeemErrorMessage(err) : 'Something went wrong. Please try again.');
      setNeedsProfile(err instanceof RedeemOfferError && err.code === 'PROFILE_INCOMPLETE');
    } finally {
      setRedeeming(false);
    }
  }

  if (offer === undefined) {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading offer…</p>;
  }

  if (offer === null) {
    return <p className="text-sm text-muted-foreground text-center py-8">Offer not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur p-5 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.5)] ring-1 ring-white/70 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
            {offer.business.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.business.logo_url}
                alt={offer.business.name}
                className="max-h-10 max-w-[80%] object-contain"
              />
            ) : (
              <Store className="w-6 h-6 text-slate-400" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
              {offer.business.name}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">{offer.title}</h1>
          </div>
        </div>

        {offer.description && <p className="text-slate-600">{offer.description}</p>}

        <div className="flex flex-wrap gap-2">
          {offer.purchase_conditions && (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold ring-1 ring-amber-200">
              {offer.purchase_conditions}
            </span>
          )}
          {!DEMO_MODE && offer.monthly_limit > 0 && (
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold ring-1 ring-sky-200">
              {offer.monthly_limit === 1 ? 'Once a month' : `Up to ${offer.monthly_limit}× a month`}
            </span>
          )}
        </div>

        {offer.terms && <p className="text-xs text-slate-500">{offer.terms}</p>}
      </div>

      {demoDetails && (
        <dl className="text-xs text-slate-600 space-y-1 rounded-2xl bg-white/80 p-4 ring-1 ring-white/70">
          <div className="flex gap-2">
            <dt className="font-semibold">Valid:</dt>
            <dd>{demoDetails.validity}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">To redeem:</dt>
            <dd>{demoDetails.redemption_rule}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Call:</dt>
            <dd>{demoDetails.phone}</dd>
          </div>
        </dl>
      )}

      {redemption ? (
        <QRDisplay
          tokenId={redemption.tokenId}
          qrToken={redemption.qrToken}
          status={redemption.status}
          expiresAt={redemption.expiresAt}
          code={redemption.code || undefined}
          couponCode={demoDetails?.coupon_code}
        />
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full px-5 py-4 rounded-full bg-gradient-to-r from-[#e0662b] to-[#f6b44b] text-white text-lg font-bold shadow-lg shadow-orange-500/30 hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {redeeming ? 'Generating your code…' : 'Redeem Now'}
          </button>
          {redeemError && <p className="text-sm text-danger text-center">{redeemError}</p>}
          {needsProfile && (
            <a href="/profile" className="block text-center text-sm text-primary underline">
              Complete your profile
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function OfferPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <RewardsGate>
        <Suspense fallback={<p className="text-sm text-muted-foreground text-center py-8">Loading offer…</p>}>
          <OfferDetail />
        </Suspense>
      </RewardsGate>
    </div>
  );
}
