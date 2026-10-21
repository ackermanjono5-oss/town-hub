import type { Offer } from './types';

/**
 * What an offer's state means to a person: its workflow status combined
 * with its dates. An approved offer is "Scheduled" before its start date,
 * "Live" inside its window and "Expired" after it, with no job flipping
 * anything — the server checks the same dates when issuing vouchers.
 */
export type OfferDisplayState = 'Draft' | 'Submitted' | 'Rejected' | 'Scheduled' | 'Live' | 'Expired' | 'Deactivated';

export function offerDisplayState(offer: Offer, now = new Date()): OfferDisplayState {
  if (offer.status === 'draft') return 'Draft';
  if (offer.status === 'submitted') return 'Submitted';
  if (offer.status === 'rejected') return 'Rejected';
  if (!offer.is_active) return 'Deactivated';
  if (offer.starts_at && new Date(offer.starts_at) > now) return 'Scheduled';
  if (offer.ends_at && new Date(offer.ends_at) < now) return 'Expired';
  return 'Live';
}

export const OFFER_STATE_STYLES: Record<OfferDisplayState, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Submitted: 'bg-sky-100 text-sky-800',
  Rejected: 'bg-rose-100 text-rose-800',
  Scheduled: 'bg-violet-100 text-violet-800',
  Live: 'bg-emerald-100 text-emerald-800',
  Expired: 'bg-slate-200 text-slate-600',
  Deactivated: 'bg-amber-100 text-amber-800',
};

/** "1 Oct 2026 – 31 Oct 2026", or a readable open-ended range. */
export function formatOfferWindow(offer: Pick<Offer, 'starts_at' | 'ends_at'>): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  if (offer.starts_at && offer.ends_at) return `${fmt(offer.starts_at)} – ${fmt(offer.ends_at)}`;
  if (offer.starts_at) return `From ${fmt(offer.starts_at)}`;
  if (offer.ends_at) return `Until ${fmt(offer.ends_at)}`;
  return 'No end date';
}
