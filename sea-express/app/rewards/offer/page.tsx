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
      return "You've already redeemed this offer this month. Check back next month!";
    case 'NOT_SUBSCRIBED':
      return 'Become a Town Hub member to redeem rewards.';
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
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {offer.business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={offer.business.logo_url}
              alt={offer.business.name}
              className="max-h-10 max-w-[80%] object-contain"
            />
          ) : (
            <Store className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{offer.business.name}</p>
          <h1 className="text-2xl font-bold">{offer.title}</h1>
        </div>
      </div>

      {offer.description && <p className="text-muted-foreground">{offer.description}</p>}
      {offer.terms && <p className="text-xs text-muted-foreground">{offer.terms}</p>}

      {demoDetails && (
        <dl className="text-xs text-muted-foreground space-y-1 rounded-lg border border-border p-3">
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
          couponCode={demoDetails?.coupon_code}
        />
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {redeeming ? 'Generating your code…' : 'Redeem Now'}
          </button>
          {redeemError && <p className="text-sm text-danger text-center">{redeemError}</p>}
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
