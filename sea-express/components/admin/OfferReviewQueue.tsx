'use client';

import { useEffect, useState } from 'react';
import { listOffersAdmin, reviewOffer } from '@/lib/admin/queries';
import type { Offer } from '@/lib/rewards/types';
import { formatOfferWindow } from '@/lib/rewards/offer-status';

type QueueOffer = Offer & { business: { name: string } };

const INPUT =
  'px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

/** Offers businesses have submitted, across every business, for Town Hub to approve or reject. */
export default function OfferReviewQueue({ onReviewed }: { onReviewed?: () => void }) {
  const [offers, setOffers] = useState<QueueOffer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const all = (await listOffersAdmin()) as QueueOffer[];
    setOffers(all.filter((o) => o.status === 'submitted'));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decide(offer: QueueOffer, decision: 'approved' | 'rejected', note: string, limit: number) {
    setError(null);
    try {
      await reviewOffer(offer.id, decision, { note, monthlyLimit: limit });
      await refresh();
      onReviewed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the decision.');
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-semibold">
        Offers awaiting approval {offers && <span className="text-muted-foreground">({offers.length})</span>}
      </h2>
      {error && <p className="text-sm text-danger">{error}</p>}
      {offers === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing waiting for approval.</p>
      ) : (
        offers.map((offer) => <QueueItem key={offer.id} offer={offer} onDecide={decide} />)
      )}
    </section>
  );
}

function QueueItem({
  offer,
  onDecide,
}: {
  offer: QueueOffer;
  onDecide: (offer: QueueOffer, decision: 'approved' | 'rejected', note: string, limit: number) => void;
}) {
  const [note, setNote] = useState('');
  const [limit, setLimit] = useState(String(offer.monthly_limit ?? 1));

  return (
    <div className="p-4 rounded-lg border-2 border-sky-200 dark:border-sky-400/30 bg-background space-y-2">
      <div>
        <p className="text-sm text-muted-foreground">{offer.business.name}</p>
        <p className="font-semibold">{offer.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatOfferWindow(offer)} · {offer.offer_type}
          {offer.discount_value != null ? ` · ${offer.discount_value}` : ''}
        </p>
      </div>
      {offer.description && <p className="text-sm">{offer.description}</p>}
      {offer.purchase_conditions && <p className="text-sm">Conditions: {offer.purchase_conditions}</p>}
      {offer.terms && <p className="text-xs text-muted-foreground">Terms: {offer.terms}</p>}
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1 text-sm">
          <span className="block text-xs text-muted-foreground">Per customer per month</span>
          <input type="number" min="1" max="31" value={limit} onChange={(e) => setLimit(e.target.value)} className={`${INPUT} w-24`} />
        </label>
        <input
          placeholder="Note to the business (required when rejecting)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${INPUT} flex-1 min-w-48`}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDecide(offer, 'approved', note, Math.min(31, Math.max(1, Number(limit) || 1)))}
          className="px-4 py-2 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => {
            if (!note.trim()) {
              window.alert('Add a note explaining why the offer is rejected.');
              return;
            }
            onDecide(offer, 'rejected', note, Number(limit) || 1);
          }}
          className="px-4 py-2 rounded-full text-sm border border-border hover:bg-secondary transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
