'use client';

import { useEffect, useState } from 'react';
import RewardsGate from '@/components/rewards/RewardsGate';
import OfferCard from '@/components/rewards/OfferCard';
import MyVouchers from '@/components/rewards/MyVouchers';
import { listActiveOffers } from '@/lib/rewards/queries';
import { DEMO_MODE, DEMO_OFFERS } from '@/lib/rewards/demo';
import type { OfferWithBusiness } from '@/lib/rewards/types';
import PageHero from '@/components/PageHero';
import { Ticket as HeroIcon } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}

export default function RewardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Rewards"
        subtitle="Exclusive monthly offers from Town Hub’s participating businesses, for registered members. Generate a voucher, then show its code at the till."
        icon={HeroIcon}
        theme="sunset"
        eyebrow="Members"
        className="mb-8"
      />

      <RewardsGate>
        <OfferGrid />
        {!DEMO_MODE && <MyVouchers />}
      </RewardsGate>
    </div>
  );
}
