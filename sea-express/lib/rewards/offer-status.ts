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
  Submitted: 'bg-sky-100 dark:bg-sky-400/15 text-sky-800 dark:text-sky-300',
  Rejected: 'bg-rose-100 dark:bg-rose-400/15 text-rose-800 dark:text-rose-300',
  Scheduled: 'bg-violet-100 dark:bg-violet-400/15 text-violet-800 dark:text-violet-300',
  Live: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300',
  Expired: 'bg-slate-200 text-slate-600',
  Deactivated: 'bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300',
};

/** "1 Oct 2026 – 31 Oct 2026", or a readable open-ended range. */
export function formatOfferWindow(offer: Pick<Offer, 'starts_at' | 'ends_at'>): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  if (offer.starts_at && offer.ends_at) return `${fmt(offer.starts_at)} – ${fmt(offer.ends_at)}`;
  if (offer.starts_at) return `From ${fmt(offer.starts_at)}`;
  if (offer.ends_at) return `Until ${fmt(offer.ends_at)}`;
  return 'No end date';
}
