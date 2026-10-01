'use client';

import { useEffect, useState } from 'react';
import RewardsGate from '@/components/rewards/RewardsGate';
import OfferCard from '@/components/rewards/OfferCard';
import { listActiveOffers } from '@/lib/rewards/queries';
import { DEMO_MODE, DEMO_OFFERS } from '@/lib/rewards/demo';
import type { OfferWithBusiness } from '@/lib/rewards/types';

function OfferGrid() {
  const [offers, setOffers] = useState<OfferWithBusiness[] | null>(DEMO_MODE ? DEMO_OFFERS : null);

  useEffect(() => {
    if (DEMO_MODE) return;
    listActiveOffers().then(setOffers);
  }, []);

  if (offers === null) {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading offers…</p>;
  }

  if (offers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No rewards are available right now — check back soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

export default function RewardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Rewards</h1>
        <p className="text-muted-foreground">
          Exclusive local offers for Town Hub members. Redeem once per business each month.
        </p>
      </div>

      <RewardsGate>
        <OfferGrid />
      </RewardsGate>
    </div>
  );
}
