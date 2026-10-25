'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';
import { deleteOffer, listMyOffers, saveOffer } from '@/lib/business/queries';
import type { OfferDraftInput } from '@/lib/business/types';
import type { Business, Offer, OfferType } from '@/lib/rewards/types';
import { OFFER_STATE_STYLES, formatOfferWindow, offerDisplayState } from '@/lib/rewards/offer-status';

const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: 'bogo', label: 'Buy one, get one free' },
  { value: 'free_item', label: 'Free item' },
  { value: 'percentage_discount', label: 'Percentage discount' },
  { value: 'fixed_discount', label: 'Rand discount' },
];

const INPUT =
  'w-full px-3 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

// Offer dates are whole days in South African time (UTC+2, no DST).
const toStart = (d: string) => (d ? `${d}T00:00:00+02:00` : null);
const toEnd = (d: string) => (d ? `${d}T23:59:59+02:00` : null);
function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date(iso));
}

/** First and last day of the month after `from`, as YYYY-MM-DD. */
function nextMonthRange(from = new Date()): [string, string] {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' })
    .format(from)
    .split('-')
    .map(Number);
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(y, m + 1, 0));
  return [first.toISOString().slice(0, 10), last.toISOString().slice(0, 10)];
}

interface FormState {
  title: string;
  description: string;
  terms: string;
  purchase_conditions: string;
  offer_type: OfferType;
  discount_value: string;
  start: string;
  end: string;
  monthly_limit: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  terms: '',
  purchase_conditions: '',
  offer_type: 'bogo',
  discount_value: '',
  start: '',
  end: '',
  monthly_limit: '1',
};

function formFromOffer(o: Offer): FormState {
  return {
    title: o.title,
    description: o.description ?? '',
    terms: o.terms ?? '',
    purchase_conditions: o.purchase_conditions ?? '',
    offer_type: o.offer_type,
    discount_value: o.discount_value?.toString() ?? '',
    start: toDateInput(o.starts_at),
    end: toDateInput(o.ends_at),
    monthly_limit: String(o.monthly_limit ?? 1),
  };
}

export default function BusinessOffersPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/business"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Business Rewards Portal
      </a>
      <RequireBusiness ownerOnly>{({ business }) => <OfferManager business={business} />}</RequireBusiness>
    </div>
  );
}

function OfferManager({ business }: { business: Business }) {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [editing, setEditing] = useState<Offer | 'new' | null>(null);

  const refresh = useCallback(async () => {
    setOffers(await listMyOffers(business.id));
  }, [business.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (editing) {
    return (
      <OfferEditor
        businessId={business.id}
        offer={editing === 'new' ? null : editing}
        onDone={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My reward offers</h1>
          <p className="text-sm text-muted-foreground">
            Submit a reward for each month. Town Hub approves every offer, and approved offers go live
            automatically on their start date.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New offer
        </button>
      </div>

      {offers === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-muted-foreground p-6 text-center rounded-xl border border-dashed border-border">
          No offers yet. Create your first monthly reward.
        </p>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => {
            const state = offerDisplayState(offer);
            const editable = offer.status !== 'approved' || state === 'Scheduled';
            return (
              <li key={offer.id} className="p-4 rounded-xl border border-border bg-background space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{offer.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatOfferWindow(offer)} · {offer.monthly_limit} per customer per month
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${OFFER_STATE_STYLES[state]}`}>
                    {state}
                  </span>
                </div>
                {offer.status === 'rejected' && offer.review_note && (
                  <p className="text-sm text-rose-700 dark:text-rose-300">Town Hub: {offer.review_note}</p>
                )}
                <div className="flex gap-2">
                  {editable && (
                    <button
                      type="button"
                      onClick={() => setEditing(offer)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      Edit
                    </button>
                  )}
                  {(offer.status === 'draft' || offer.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`Delete "${offer.title}"?`)) return;
                        try {
                          await deleteOffer(offer.id);
                        } catch (err) {
                          window.alert(err instanceof Error ? err.message : 'Could not delete.');
                        }
                        await refresh();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OfferEditor({
  businessId,
  offer,
  onDone,
}: {
  businessId: string;
  offer: Offer | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<FormState>(offer ? formFromOffer(offer) : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsValue = form.offer_type === 'percentage_discount' || form.offer_type === 'fixed_discount';
  const wasApproved = offer?.status === 'approved';

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(status: 'draft' | 'submitted') {
    setError(null);
    if (!form.title.trim()) return setError('Give the reward a title.');
    if (status === 'submitted' && (!form.start || !form.end)) {
      return setError('Set a start and end date before submitting.');
    }
    if (form.start && form.end && form.end < form.start) return setError('The end date is before the start date.');
    const limit = Number(form.monthly_limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 31) {
      return setError('The monthly limit must be a whole number from 1 to 31.');
    }

    const input: OfferDraftInput = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      terms: form.terms.trim() || null,
      purchase_conditions: form.purchase_conditions.trim() || null,
      offer_type: form.offer_type,
      discount_value: needsValue && form.discount_value ? Number(form.discount_value) : null,
      starts_at: toStart(form.start),
      ends_at: toEnd(form.end),
      monthly_limit: limit,
    };

    setSaving(true);
    try {
      await saveOffer(businessId, input, status, offer?.id);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the offer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{offer ? 'Edit offer' : 'New reward offer'}</h1>
        {wasApproved && (
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            This offer is approved. Saving changes sends it back to Town Hub for approval. Vouchers
            already issued keep their original terms.
          </p>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Reward title *</span>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Buy one burger, get one free" className={INPUT} />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={INPUT} />
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Reward type</span>
          <select value={form.offer_type} onChange={(e) => set('offer_type', e.target.value as OfferType)} className={INPUT}>
            {OFFER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        {needsValue && (
          <label className="block space-y-1">
            <span className="text-sm font-medium">{form.offer_type === 'percentage_discount' ? 'Discount (%)' : 'Discount (R)'}</span>
            <input type="number" min="0" value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} className={INPUT} />
          </label>
        )}
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Purchase conditions</span>
        <input
          value={form.purchase_conditions}
          onChange={(e) => set('purchase_conditions', e.target.value)}
          placeholder="e.g. With any main meal"
          className={INPUT}
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium">Terms and conditions</span>
        <textarea rows={3} value={form.terms} onChange={(e) => set('terms', e.target.value)} className={INPUT} />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Dates *</span>
          <button
            type="button"
            onClick={() => {
              const [s, e] = nextMonthRange();
              setForm((f) => ({ ...f, start: s, end: e }));
            }}
            className="text-sm text-primary underline"
          >
            Use next month
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">Start</span>
            <input type="date" value={form.start} onChange={(e) => set('start', e.target.value)} className={INPUT} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted-foreground">End</span>
            <input type="date" value={form.end} onChange={(e) => set('end', e.target.value)} className={INPUT} />
          </label>
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium">Redemptions per customer per month</span>
        <input type="number" min="1" max="31" value={form.monthly_limit} onChange={(e) => set('monthly_limit', e.target.value)} className={INPUT} />
        <span className="block text-xs text-muted-foreground">Town Hub may adjust this when approving.</span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-3 rounded-full border border-border hover:bg-secondary transition"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save('draft')}
          className="px-5 py-3 rounded-full border border-border hover:bg-secondary transition disabled:opacity-60"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save('submitted')}
          className="flex-1 px-5 py-3 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Submit to Town Hub'}
        </button>
      </div>
    </div>
  );
}
