'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Home, Loader2, Plus, Trash2, X } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import type { Business } from '@/lib/rewards/types';
import {
  deleteListing,
  listAgencyListings,
  saveListing,
  setListingSold,
} from '@/lib/property/queries';
import { removeListingPhotos, uploadListingPhoto } from '@/lib/property/photos';
import {
  MAX_PHOTOS,
  PROPERTY_TYPES,
  formatPrice,
  listingStateLabel,
  validateListing,
  type ListingInput,
  type ListingType,
  type PropertyListing,
  type PropertyType,
} from '@/lib/property/types';

const INPUT =
  'w-full px-3 py-2.5 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

const STATE_STYLE: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  'Waiting for Town Hub': 'bg-sky-100 dark:bg-sky-400/15 text-sky-800 dark:text-sky-300',
  Live: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300',
  'Needs changes': 'bg-rose-100 dark:bg-rose-400/15 text-rose-800 dark:text-rose-300',
  Sold: 'bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300',
  Let: 'bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300',
};

export default function BusinessPropertyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/business"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Business Rewards Portal
      </a>
      <RequireBusiness ownerOnly>{({ business }) => <ListingManager business={business} />}</RequireBusiness>
    </div>
  );
}

function ListingManager({ business }: { business: Business }) {
  const [listings, setListings] = useState<PropertyListing[] | null>(null);
  const [editing, setEditing] = useState<PropertyListing | 'new' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setListings(await listAgencyListings(business.id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your listings.');
      setListings([]);
    }
  }, [business.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (editing) {
    return (
      <ListingEditor
        business={business}
        listing={editing === 'new' ? null : editing}
        onDone={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    );
  }

  async function act(fn: () => Promise<void>) {
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Property listings</h1>
          <p className="text-sm text-muted-foreground">
            List homes for sale or to rent on Town Hub&apos;s Property page. Town Hub checks each listing
            before it goes live, usually within a working day.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New listing
        </button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {listings === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-border text-center">
          <Home className="w-8 h-8 mx-auto text-slate-400" aria-hidden="true" />
          <p className="mt-2 font-medium">No listings yet</p>
          <p className="text-sm text-muted-foreground">Add your first property to show it on Town Hub.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const state = listingStateLabel(l);
            return (
              <li key={l.id} className="p-4 rounded-xl border border-border bg-background">
                <div className="flex gap-3">
                  {l.photos[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={l.photos[0]} alt="" className="h-16 w-20 flex-none rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-16 w-20 flex-none place-items-center rounded-lg bg-secondary">
                      <Home className="h-6 w-6 text-slate-400" aria-hidden="true" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATE_STYLE[state]}`}>
                      {state}
                    </span>
                    <p className="mt-1 font-semibold leading-snug">{l.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(l.price, l.listing_type)} · {getTownLabel(l.town)}
                    </p>
                  </div>
                </div>
                {l.status === 'rejected' && l.review_note && (
                  <p className="mt-3 rounded-lg bg-rose-100 dark:bg-rose-400/15 px-3 py-2 text-sm text-rose-800 dark:text-rose-300">
                    Town Hub: {l.review_note}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(l)}
                    className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary"
                  >
                    Edit
                  </button>
                  {l.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => act(() => setListingSold(l.id, !l.is_sold))}
                      className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary"
                    >
                      {l.is_sold ? 'Back on the market' : l.listing_type === 'rent' ? 'Mark as let' : 'Mark as sold'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${l.title}"? This can't be undone.`)) {
                        act(async () => {
                          await deleteListing(l.id);
                          await removeListingPhotos(l.photos).catch(() => undefined);
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-sm text-danger hover:bg-secondary"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface FormState {
  listing_type: ListingType;
  property_type: PropertyType;
  title: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  garages: string;
  floor_size: string;
  erf_size: string;
  town: string;
  suburb: string;
  description: string;
  photos: string[];
  agency_url: string;
  agent_name: string;
  agent_phone: string;
  agent_email: string;
}

function formFor(listing: PropertyListing | null, business: Business): FormState {
  const num = (v: number | null) => (v == null ? '' : String(v));
  return {
    listing_type: listing?.listing_type ?? 'sale',
    property_type: listing?.property_type ?? 'house',
    title: listing?.title ?? '',
    price: num(listing?.price ?? null),
    bedrooms: num(listing?.bedrooms ?? null),
    bathrooms: num(listing?.bathrooms ?? null),
    garages: num(listing?.garages ?? null),
    floor_size: num(listing?.floor_size ?? null),
    erf_size: num(listing?.erf_size ?? null),
    town: listing?.town ?? business.town ?? '',
    suburb: listing?.suburb ?? '',
    description: listing?.description ?? '',
    photos: listing?.photos ?? [],
    agency_url: listing?.agency_url ?? '',
    agent_name: listing?.agent_name ?? business.contact_name ?? '',
    agent_phone: listing?.agent_phone ?? business.phone ?? '',
    agent_email: listing?.agent_email ?? business.email ?? '',
  };
}

function toInput(form: FormState): ListingInput {
  const num = (v: string) => (v.trim() === '' ? null : Number(v));
  const text = (v: string) => (v.trim() === '' ? null : v.trim());
  return {
    listing_type: form.listing_type,
    property_type: form.property_type,
    title: form.title.trim(),
    description: text(form.description),
    price: Number(form.price),
    bedrooms: num(form.bedrooms),
    bathrooms: num(form.bathrooms),
    garages: num(form.garages),
    floor_size: num(form.floor_size),
    erf_size: num(form.erf_size),
    town: form.town,
    suburb: text(form.suburb),
    photos: form.photos,
    agency_url: text(form.agency_url),
    agent_name: text(form.agent_name),
    agent_phone: text(form.agent_phone),
    agent_email: text(form.agent_email),
  };
}

function ListingEditor({
  business,
  listing,
  onDone,
}: {
  business: Business;
  listing: PropertyListing | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => formFor(listing, business));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Photos removed in this edit, deleted from storage once the save succeeds.
  const [removed, setRemoved] = useState<string[]>([]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - form.photos.length;
    const chosen = [...files].slice(0, room);
    if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);
    setUploading((n) => n + chosen.length);
    for (const file of chosen) {
      try {
        const url = await uploadListingPhoto(file);
        setForm((f) => ({ ...f, photos: [...f.photos, url].slice(0, MAX_PHOTOS) }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'A photo could not be uploaded.');
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function removePhoto(url: string) {
    setForm((f) => ({ ...f, photos: f.photos.filter((p) => p !== url) }));
    setRemoved((r) => [...r, url]);
  }

  function makeCover(url: string) {
    setForm((f) => ({ ...f, photos: [url, ...f.photos.filter((p) => p !== url)] }));
  }

  async function save(status: 'draft' | 'submitted') {
    const input = toInput(form);
    const problem = validateListing(input);
    if (problem) {
      setError(problem);
      return;
    }
    if (status === 'submitted' && input.photos.length === 0) {
      setError('Add at least one photo before submitting.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveListing(business.id, input, status, listing?.id);
      await removeListingPhotos(removed).catch(() => undefined);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the listing.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save('submitted');
      }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{listing ? 'Edit listing' : 'New listing'}</h1>
        <button type="button" onClick={onDone} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>

      {listing?.status === 'approved' && (
        <p className="rounded-lg bg-sky-100 dark:bg-sky-400/15 px-3 py-2 text-sm text-sky-800 dark:text-sky-300">
          This listing is live. Saving changes sends it back to Town Hub to check, and it&apos;s hidden until
          they approve it again.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Listing type">
        {(['sale', 'rent'] as ListingType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set('listing_type', t)}
            aria-pressed={form.listing_type === t}
            className={`py-2.5 rounded-md border text-sm font-semibold transition ${
              form.listing_type === t ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'
            }`}
          >
            {t === 'sale' ? 'For sale' : 'To rent'}
          </button>
        ))}
      </div>

      <Field label="Title *" hint="e.g. 3-bedroom family home with sea views">
        <input required value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} className={INPUT} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={form.listing_type === 'rent' ? 'Rent per month (R) *' : 'Price (R) *'}>
          <input
            required
            inputMode="numeric"
            value={form.price}
            onChange={(e) => set('price', e.target.value.replace(/[^\d]/g, ''))}
            className={INPUT}
          />
        </Field>
        <Field label="Property type">
          <select value={form.property_type} onChange={(e) => set('property_type', e.target.value as PropertyType)} className={INPUT}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumberField label="Bedrooms" value={form.bedrooms} onChange={(v) => set('bedrooms', v)} />
        <NumberField label="Bathrooms" value={form.bathrooms} onChange={(v) => set('bathrooms', v)} decimal />
        <NumberField label="Garages" value={form.garages} onChange={(v) => set('garages', v)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Floor size (m²)" value={form.floor_size} onChange={(v) => set('floor_size', v)} />
        <NumberField label="Erf size (m²)" value={form.erf_size} onChange={(v) => set('erf_size', v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Town *">
          <select required value={form.town} onChange={(e) => set('town', e.target.value)} className={INPUT}>
            <option value="">Choose…</option>
            {TOWNS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Suburb or estate">
          <input value={form.suburb} onChange={(e) => set('suburb', e.target.value)} maxLength={80} className={INPUT} />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={6}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={4000}
          className={INPUT}
        />
      </Field>

      <div>
        <p className="text-sm font-medium mb-2">
          Photos ({form.photos.length}/{MAX_PHOTOS}) — the first one is the cover
        </p>
        <div className="grid grid-cols-3 gap-2">
          {form.photos.map((url, i) => (
            <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              {i === 0 ? (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  Cover
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                >
                  Make cover
                </button>
              )}
            </div>
          ))}
          {Array.from({ length: uploading }, (_, i) => (
            <div key={`up-${i}`} className="grid aspect-[4/3] place-items-center rounded-lg bg-secondary">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-hidden="true" />
            </div>
          ))}
          {form.photos.length + uploading < MAX_PHOTOS && (
            <label className="grid aspect-[4/3] cursor-pointer place-items-center rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary">
              <span className="flex flex-col items-center gap-1">
                <Camera className="h-5 w-5" aria-hidden="true" />
                Add photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>
      </div>

      <fieldset className="space-y-3 p-4 rounded-xl border border-border">
        <legend className="px-1 text-sm font-semibold">Contact for this listing</legend>
        <Field label="Agent's name">
          <input value={form.agent_name} onChange={(e) => set('agent_name', e.target.value)} maxLength={80} className={INPUT} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input type="tel" value={form.agent_phone} onChange={(e) => set('agent_phone', e.target.value)} maxLength={30} className={INPUT} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.agent_email} onChange={(e) => set('agent_email', e.target.value)} maxLength={120} className={INPUT} />
          </Field>
        </div>
        <Field label="Link to this listing on your website" hint="Optional, starting with https://">
          <input type="url" value={form.agency_url} onChange={(e) => set('agency_url', e.target.value)} className={INPUT} />
        </Field>
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={busy || uploading > 0}
          className="flex-1 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-sm hover:brightness-110 transition disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Submit to Town Hub'}
        </button>
        <button
          type="button"
          disabled={busy || uploading > 0}
          onClick={() => save('draft')}
          className="px-5 py-3 rounded-full border border-border font-medium hover:bg-secondary transition disabled:opacity-60"
        >
          Save draft
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  decimal = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  decimal?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        inputMode={decimal ? 'decimal' : 'numeric'}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(decimal ? /[^\d.]/g : /[^\d]/g, ''))}
        className={INPUT}
      />
    </Field>
  );
}
