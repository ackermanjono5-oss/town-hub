'use client';

import { useEffect, useState } from 'react';
import { getTownLabel } from '@/lib/garden-route/towns';
import { listListingsForReview, reviewListing } from '@/lib/property/queries';
import {
  formatPrice,
  listingStateLabel,
  propertyTypeLabel,
  type PropertyListing,
} from '@/lib/property/types';

type View = 'submitted' | 'all';

const INPUT =
  'w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

export default function AdminPropertyPage() {
  const [listings, setListings] = useState<PropertyListing[] | null>(null);
  const [view, setView] = useState<View>('submitted');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setListings(await listListingsForReview());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load listings.');
      setListings([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decide(id: string, decision: 'approved' | 'rejected', note: string) {
    setError(null);
    try {
      await reviewListing(id, decision, note.trim() || null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the decision.');
    }
  }

  const shown = (listings ?? []).filter((l) => view === 'all' || l.status === 'submitted');
  const waiting = (listings ?? []).filter((l) => l.status === 'submitted').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Property listings</h1>
        <p className="text-muted-foreground">
          Estate agencies submit listings from the Business Portal. Approve them to put them on the
          Property page, or send them back with a note saying what to fix.
        </p>
      </div>

      <div className="flex gap-2">
        {(['submitted', 'all'] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${
              view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {v === 'submitted' ? `Waiting (${waiting})` : 'All listings'}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {listings === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {view === 'submitted' ? 'Nothing waiting for approval.' : 'No listings yet.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {shown.map((l) => (
            <ReviewItem key={l.id} listing={l} onDecide={decide} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewItem({
  listing: l,
  onDecide,
}: {
  listing: PropertyListing;
  onDecide: (id: string, decision: 'approved' | 'rejected', note: string) => void;
}) {
  const [note, setNote] = useState(l.review_note ?? '');
  const specs = [
    l.bedrooms != null && `${l.bedrooms} bed`,
    l.bathrooms != null && `${l.bathrooms} bath`,
    l.garages != null && `${l.garages} garage`,
    l.floor_size != null && `${l.floor_size} m² floor`,
    l.erf_size != null && `${l.erf_size} m² erf`,
  ].filter(Boolean);

  return (
    <li className="p-4 rounded-lg border border-border bg-background space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold">{l.agency_name ?? 'Agency'}</span>
        <span className="text-muted-foreground">
          {listingStateLabel(l)} · {l.listing_type === 'rent' ? 'To rent' : 'For sale'} · {propertyTypeLabel(l.property_type)} ·{' '}
          {l.suburb ? `${l.suburb}, ` : ''}
          {getTownLabel(l.town)}
        </span>
      </div>
      <div>
        <p className="font-semibold">{l.title}</p>
        <p className="text-sm">{formatPrice(l.price, l.listing_type)}</p>
        {specs.length > 0 && <p className="text-xs text-muted-foreground">{specs.join(' · ')}</p>}
      </div>
      {l.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {l.photos.map((url, i) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="flex-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="h-20 w-28 rounded-md object-cover" />
            </a>
          ))}
        </div>
      )}
      {l.description && <p className="text-sm whitespace-pre-line break-words">{l.description}</p>}
      <p className="text-xs text-muted-foreground break-all">
        Contact: {[l.agent_name, l.agent_phone, l.agent_email].filter(Boolean).join(' · ') || '—'}
        {l.agency_url && (
          <>
            {' · '}
            <a href={l.agency_url} target="_blank" rel="noopener noreferrer" className="underline">
              agency page
            </a>
          </>
        )}
      </p>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note to the agency (required when sending back)"
        className={INPUT}
      />
      <div className="flex flex-wrap gap-2">
        {l.status !== 'approved' && (
          <button
            type="button"
            onClick={() => onDecide(l.id, 'approved', note)}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:brightness-110"
          >
            Approve
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (!note.trim()) {
              window.alert('Add a note saying what needs to change.');
              return;
            }
            onDecide(l.id, 'rejected', note);
          }}
          className="px-3 py-1.5 rounded-md border border-border text-sm text-danger hover:bg-secondary"
        >
          {l.status === 'approved' ? 'Take down' : 'Send back'}
        </button>
      </div>
    </li>
  );
}
