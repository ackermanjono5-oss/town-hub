'use client';

import { useEffect, useState } from 'react';
import {
  createOfferAdmin,
  listBusinesses,
  listOffersAdmin,
  toggleOfferActive,
  updateOfferAdmin,
} from '@/lib/admin/queries';
import type { BusinessWithOwner } from '@/lib/admin/types';
import type { Offer, OfferType } from '@/lib/rewards/types';

const OFFER_TYPES: { value: OfferType; label: string }[] = [
  { value: 'percentage_discount', label: 'Percentage discount' },
  { value: 'fixed_discount', label: 'Fixed discount' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'free_item', label: 'Free item' },
];

type OfferRow = Offer & { business: { name: string } };

function EditableOfferRow({ offer, onSaved }: { offer: OfferRow; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(offer.title);
  const [description, setDescription] = useState(offer.description ?? '');
  const [discountValue, setDiscountValue] = useState(offer.discount_value?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateOfferAdmin(offer.id, {
        title,
        description: description || null,
        discount_value: discountValue ? Number(discountValue) : null,
      });
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    await toggleOfferActive(offer.id, !offer.is_active);
    onSaved();
  }

  if (editing) {
    return (
      <div className="p-4 rounded-lg border border-border bg-background space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm"
        />
        <input
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder="Discount value"
          type="number"
          className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="p-4 rounded-lg border border-border bg-background flex items-center justify-between gap-4 cursor-pointer hover:border-primary transition"
    >
      <div>
        <p className="font-semibold">{offer.title}</p>
        <p className="text-sm text-muted-foreground">
          {offer.business.name} · {offer.offer_type}
          {offer.discount_value != null ? ` · ${offer.discount_value}` : ''}
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
          offer.is_active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {offer.is_active ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
}

export default function AdminOffersPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOwner[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [offers, setOffers] = useState<OfferRow[] | null>(null);

  const [title, setTitle] = useState('');
  const [offerType, setOfferType] = useState<OfferType>('percentage_discount');
  const [discountValue, setDiscountValue] = useState('');
  const [terms, setTerms] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listBusinesses().then((list) => {
      setBusinesses(list);
      if (list.length > 0) setSelectedBusiness(list[0].id);
    });
  }, []);

  async function refresh() {
    setOffers((await listOffersAdmin(selectedBusiness || undefined)) as OfferRow[]);
  }

  useEffect(() => {
    if (selectedBusiness) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusiness]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusiness) return;
    setCreating(true);
    setError(null);
    try {
      await createOfferAdmin({
        business_id: selectedBusiness,
        title,
        offer_type: offerType,
        discount_value: discountValue ? Number(discountValue) : undefined,
        terms: terms || undefined,
        is_active: true,
      });
      setTitle('');
      setDiscountValue('');
      setTerms('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Offers</h1>
        <p className="text-muted-foreground">Create and manage offers for a business.</p>
      </div>

      <select
        value={selectedBusiness}
        onChange={(e) => setSelectedBusiness(e.target.value)}
        className="px-3 py-2 rounded-md border border-border bg-background"
      >
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <form onSubmit={handleCreate} className="p-4 rounded-lg border border-border bg-background space-y-3">
        <p className="font-semibold text-sm">Create offer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Title (e.g. 10% off coffee)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={offerType}
            onChange={(e) => setOfferType(e.target.value as OfferType)}
            className="px-3 py-2 rounded-md border border-border bg-background"
          >
            {OFFER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Discount value"
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            placeholder="Terms (optional)"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={creating || !selectedBusiness}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {creating ? 'Creating…' : 'Create offer'}
        </button>
      </form>

      <div className="space-y-3">
        {offers === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No offers for this business yet.</p>
        ) : (
          offers.map((offer) => <EditableOfferRow key={offer.id} offer={offer} onSaved={refresh} />)
        )}
      </div>
    </div>
  );
}
