'use client';

import { useEffect, useState } from 'react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import {
  createLegalNotice,
  listLegalNoticesAdmin,
  setLegalNoticeActive,
} from '@/lib/legal-notices/queries';
import {
  LEGAL_NOTICE_CATEGORIES,
  getLegalNoticeCategoryLabel,
  type LegalNotice,
  type LegalNoticeCategory,
} from '@/lib/legal-notices/types';

const INPUT =
  'px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<LegalNotice[] | null>(null);

  const [category, setCategory] = useState<LegalNoticeCategory>('deceased_estate');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [town, setTown] = useState('');
  const [firmName, setFirmName] = useState('');
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [closesOn, setClosesOn] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setNotices(await listLegalNoticesAdmin());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createLegalNotice({
        category,
        title,
        body,
        town: town || null,
        firm_name: firmName || null,
        reference: reference || null,
        contact: contact || null,
        closes_on: closesOn || null,
      });
      setTitle('');
      setBody('');
      setReference('');
      setClosesOn('');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish notice.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(notice: LegalNotice) {
    await setLegalNoticeActive(notice.id, !notice.is_active);
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Legal Notices</h1>
        <p className="text-muted-foreground">
          Publish notices sent in by attorneys and law firms.
        </p>
      </div>

      <form onSubmit={handleCreate} className="p-4 rounded-lg border border-border bg-background space-y-3">
        <p className="font-semibold text-sm">Publish notice</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as LegalNoticeCategory)}
            className={INPUT}
          >
            {LEGAL_NOTICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select value={town} onChange={(e) => setTown(e.target.value)} className={INPUT}>
            <option value="">All towns / region-wide</option>
            {TOWNS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Title (e.g. Estate Late John Smith)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${INPUT} sm:col-span-2`}
          />
          <textarea
            required
            rows={6}
            placeholder="Full notice text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${INPUT} sm:col-span-2`}
          />
          <input
            placeholder="Attorney / firm name"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            className={INPUT}
          />
          <input
            placeholder="Contact (phone or email)"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={INPUT}
          />
          <input
            placeholder="Estate / case / tender reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={INPUT}
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Closes on
            <input
              type="date"
              value={closesOn}
              onChange={(e) => setClosesOn(e.target.value)}
              className={`${INPUT} flex-1`}
            />
          </label>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
        >
          {creating ? 'Publishing…' : 'Publish notice'}
        </button>
      </form>

      <div className="space-y-3">
        {notices === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notices published yet.</p>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-lg border border-border bg-background flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">
                  {getLegalNoticeCategoryLabel(n.category)} · {n.published_on}
                  {n.town ? ` · ${getTownLabel(n.town)}` : ''}
                  {n.firm_name ? ` · ${n.firm_name}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(n)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  n.is_active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {n.is_active ? 'Published' : 'Hidden'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
