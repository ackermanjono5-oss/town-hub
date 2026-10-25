'use client';

import { useEffect, useState } from 'react';
import {
  createBusiness,
  generateRegistrationCode,
  listBusinesses,
  setAdvertiserStatus,
  setBusinessApproval,
} from '@/lib/admin/queries';
import type { BusinessWithOwner } from '@/lib/admin/types';
import type { AdvertiserStatus, ApprovalStatus } from '@/lib/rewards/types';
import { isBusinessEligible } from '@/lib/business/queries';
import { getTownLabel } from '@/lib/garden-route/towns';
import { formatDateTime } from '@/lib/rewards/voucher';

const INPUT =
  'px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  pending: 'bg-sky-100 dark:bg-sky-400/15 text-sky-800 dark:text-sky-300',
  approved: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-300',
  denied: 'bg-rose-100 dark:bg-rose-400/15 text-rose-800 dark:text-rose-300',
  suspended: 'bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300',
};

const ADVERTISER_LABELS: Record<AdvertiserStatus, string> = {
  active: 'Active paying advertiser',
  expired: 'Subscription expired',
  not_advertiser: 'Not yet an advertiser',
  needs_verification: 'Needs verification',
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOwner[] | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeByBusiness, setCodeByBusiness] = useState<Record<string, string>>({});

  async function refresh() {
    setBusinesses(await listBusinesses());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    await run(async () => {
      await createBusiness({ name, description: description || undefined, category: category || undefined });
      setName('');
      setDescription('');
      setCategory('');
    });
    setCreating(false);
  }

  async function handleGenerateCode(businessId: string, businessName: string) {
    try {
      const code = await generateRegistrationCode(businessId, businessName);
      setCodeByBusiness((prev) => ({ ...prev, [businessId]: code }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate code.');
    }
  }

  const pending = (businesses ?? []).filter((b) => b.approval_status === 'pending' && b.owner);
  const others = (businesses ?? []).filter((b) => !(b.approval_status === 'pending' && b.owner));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Businesses</h1>
        <p className="text-muted-foreground">
          Review loyalty rewards applications, confirm advertising subscriptions and manage access.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-semibold">
          Applications awaiting review {businesses && <span className="text-muted-foreground">({pending.length})</span>}
        </h2>
        {businesses === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications waiting.</p>
        ) : (
          pending.map((b) => (
            <ApplicationCard key={b.id} business={b} onDecision={(status, note) => run(() => setBusinessApproval(b.id, status, note))} onAdvertiser={(s, until) => run(() => setAdvertiserStatus(b.id, s, until))} />
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">All businesses</h2>
        {businesses !== null && others.length === 0 && (
          <p className="text-sm text-muted-foreground">No businesses yet.</p>
        )}
        {others.map((b) => (
          <div key={b.id} className="p-4 rounded-lg border border-border bg-background space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {b.trading_name || b.name}
                  {b.registered_name && b.registered_name !== (b.trading_name || b.name) && (
                    <span className="font-normal text-muted-foreground"> ({b.registered_name})</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {b.owner?.full_name ?? 'Unclaimed'} · {b.category ?? 'Uncategorized'}
                  {b.registration_number ? ` · Reg ${b.registration_number}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {b.approval_status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${APPROVAL_STYLES[b.approval_status]}`}>
                    {b.approval_status}
                  </span>
                )}
                <span className={`text-xs ${isBusinessEligible(b) ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                  {isBusinessEligible(b) ? 'Rewards active' : 'Rewards inactive'}
                </span>
              </div>
            </div>

            <AdvertiserControls business={b} onSave={(s, until) => run(() => setAdvertiserStatus(b.id, s, until))} />

            <div className="flex flex-wrap gap-2">
              {b.approval_status === 'approved' && (
                <button
                  type="button"
                  onClick={() => {
                    const note = window.prompt('Reason for suspending (shown to the business):') ?? undefined;
                    if (note !== undefined) run(() => setBusinessApproval(b.id, 'suspended', note));
                  }}
                  className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
                >
                  Suspend
                </button>
              )}
              {(b.approval_status === 'suspended' || b.approval_status === 'denied') && (
                <button
                  type="button"
                  onClick={() => run(() => setBusinessApproval(b.id, 'approved'))}
                  className="px-3 py-1.5 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
                >
                  {b.approval_status === 'suspended' ? 'Reinstate' : 'Approve'}
                </button>
              )}
              {!b.owner &&
                (codeByBusiness[b.id] ? (
                  <code className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-sm font-mono">
                    {codeByBusiness[b.id]}
                  </code>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerateCode(b.id, b.name)}
                    className="px-3 py-1.5 rounded-full text-sm border border-border hover:bg-secondary transition"
                  >
                    Generate owner code
                  </button>
                ))}
            </div>
          </div>
        ))}
      </section>

      <form onSubmit={handleCreate} className="p-4 rounded-lg border border-border bg-background space-y-3">
        <p className="font-semibold text-sm">Create a business directly</p>
        <p className="text-xs text-muted-foreground">
          For businesses Town Hub signs up itself. Generate an owner code afterwards so the owner can claim it.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input required placeholder="Business name" value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
          <input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT} />
          <input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {creating ? 'Creating…' : 'Create business'}
        </button>
      </form>
    </div>
  );
}

function ApplicationCard({
  business: b,
  onDecision,
  onAdvertiser,
}: {
  business: BusinessWithOwner;
  onDecision: (status: ApprovalStatus, note?: string) => void;
  onAdvertiser: (status: AdvertiserStatus, paidUntil: string | null) => void;
}) {
  const [note, setNote] = useState('');
  const rows: [string, string | null | undefined][] = [
    ['Registered name', b.registered_name],
    ['Trading name', b.trading_name],
    ['Registration no.', b.registration_number],
    ['Directory listing', b.directory_listing_id],
    ['Contact person', b.contact_name],
    ['Phone', b.phone],
    ['Email', b.email],
    ['Address', [b.address, b.town ? getTownLabel(b.town) : null].filter(Boolean).join(', ')],
    ['Advertising ref.', b.advertising_reference],
    ['Applied', b.created_at ? formatDateTime(b.created_at) : null],
    ['Terms accepted', b.terms_accepted_at ? formatDateTime(b.terms_accepted_at) : null],
  ];

  return (
    <div className="p-4 rounded-lg border-2 border-sky-200 dark:border-sky-400/30 bg-background space-y-3">
      <p className="font-semibold">{b.trading_name || b.registered_name || b.name}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>
      <AdvertiserControls business={b} onSave={onAdvertiser} />
      <textarea
        rows={2}
        placeholder="Note to the business (required when denying)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={`${INPUT} w-full`}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onDecision('approved', note)}
          className="px-4 py-2 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => {
            if (!note.trim()) {
              window.alert('Add a note explaining why the application is denied.');
              return;
            }
            onDecision('denied', note);
          }}
          className="px-4 py-2 rounded-full text-sm border border-border hover:bg-secondary transition"
        >
          Deny
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        An accepted business can run rewards only once its advertiser status is set to Active.
      </p>
    </div>
  );
}

function AdvertiserControls({
  business,
  onSave,
}: {
  business: BusinessWithOwner;
  onSave: (status: AdvertiserStatus, paidUntil: string | null) => void;
}) {
  const [status, setStatus] = useState<AdvertiserStatus>(business.advertiser_status ?? 'needs_verification');
  const [paidUntil, setPaidUntil] = useState(business.advertising_paid_until ?? '');
  const dirty = status !== business.advertiser_status || paidUntil !== (business.advertising_paid_until ?? '');

  return (
    <div className="flex flex-wrap items-end gap-2 text-sm">
      <label className="space-y-1">
        <span className="block text-xs text-muted-foreground">Advertising subscription</span>
        <select value={status} onChange={(e) => setStatus(e.target.value as AdvertiserStatus)} className={INPUT}>
          {(Object.keys(ADVERTISER_LABELS) as AdvertiserStatus[]).map((s) => (
            <option key={s} value={s}>
              {ADVERTISER_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-xs text-muted-foreground">Paid until (optional)</span>
        <input type="date" value={paidUntil} onChange={(e) => setPaidUntil(e.target.value)} className={INPUT} />
      </label>
      {dirty && (
        <button
          type="button"
          onClick={() => onSave(status, paidUntil || null)}
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          Save
        </button>
      )}
    </div>
  );
}
