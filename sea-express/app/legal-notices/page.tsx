'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Scale,
  ScrollText,
  FileWarning,
  Building2,
  Landmark,
  Gavel,
  Mail,
  MapPin,
  CalendarClock,
  Hash,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import { getTownLabel } from '@/lib/garden-route/towns';
import { listLegalNotices } from '@/lib/legal-notices/queries';
import {
  LEGAL_NOTICE_CATEGORIES,
  type LegalNotice,
  type LegalNoticeCategory,
} from '@/lib/legal-notices/types';

const CATEGORY_ICON: Record<LegalNoticeCategory, LucideIcon> = {
  deceased_estate: ScrollText,
  claim: FileWarning,
  liquidation: Building2,
  insolvency: Landmark,
  tender: Gavel,
};

const SUBMIT_EMAIL = 'info@seaexpress.co.za';

function formatDate(iso: string): string {
  // Dates are plain YYYY-MM-DD; parse as local so the day never shifts.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function LegalNoticesPage() {
  const [category, setCategory] = useState<LegalNoticeCategory>('deceased_estate');
  const [notices, setNotices] = useState<LegalNotice[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    listLegalNotices().then((list) => {
      if (!cancelled) setNotices(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const map = new Map<LegalNoticeCategory, number>();
    for (const n of notices ?? []) map.set(n.category, (map.get(n.category) ?? 0) + 1);
    return map;
  }, [notices]);

  const active = LEGAL_NOTICE_CATEGORIES.find((c) => c.value === category)!;
  const visible = (notices ?? []).filter((n) => n.category === category);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1f2937] via-[#334155] to-[#64748b] text-white shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative p-6 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Sea Express
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Legal Notices</h1>
          <p className="mt-3 max-w-xl text-white/80">
            Formal notices published for legal and official purposes — deceased
            estates, claims, liquidations, insolvencies and tenders across the Garden
            Route.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${SUBMIT_EMAIL}?subject=${encodeURIComponent('Legal notice for publication')}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0f172a] font-semibold shadow-lg shadow-black/20 hover:bg-[#f1f5f9] active:scale-95 transition"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              Submit a notice
            </a>
            <a
              href="/attorneys"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/15 text-white font-semibold hover:bg-white/25 active:scale-95 transition"
            >
              <Scale className="w-5 h-5" aria-hidden="true" />
              Find an attorney
            </a>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Notice type
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {LEGAL_NOTICE_CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c.value];
            const selected = c.value === category;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={selected}
                className={[
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition active:scale-95',
                  selected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100',
                ].join(' ')}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {c.label}
                {notices && (
                  <span
                    className={[
                      'ml-0.5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold',
                      selected ? 'bg-black/20' : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {counts.get(c.value) ?? 0}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-500">{active.description}</p>
      </section>

      <div className="mt-6">
        {!isSupabaseConfigured ? (
          <SupabaseSetupNotice feature="Legal Notices" />
        ) : notices === null ? (
          <p className="text-sm text-slate-500 text-center py-12">Loading notices…</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-card/80 border border-white/60 dark:border-white/10 p-8 text-center shadow">
            {(() => {
              const Icon = CATEGORY_ICON[category];
              return <Icon className="w-8 h-8 mx-auto text-slate-300" aria-hidden="true" />;
            })()}
            <p className="mt-3 font-medium text-slate-700">
              No {active.label.toLowerCase()} published right now
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Attorneys and law firms can submit notices for publication to{' '}
              <a href={`mailto:${SUBMIT_EMAIL}`} className="text-primary underline">
                {SUBMIT_EMAIL}
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Notices are published as supplied by the submitting attorney or firm. Contact
        them directly about any notice. To publish a notice, email{' '}
        <a href={`mailto:${SUBMIT_EMAIL}`} className="underline">
          {SUBMIT_EMAIL}
        </a>
        .
      </p>
    </div>
  );
}

function NoticeCard({ notice }: { notice: LegalNotice }) {
  return (
    <article className="rounded-2xl bg-card shadow-md border border-slate-200/70 p-5">
      <p className="text-xs text-slate-500">Published {formatDate(notice.published_on)}</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">{notice.title}</h2>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
        {notice.reference && (
          <span className="inline-flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-slate-400" aria-hidden="true" />
            {notice.reference}
          </span>
        )}
        {notice.town && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
            {getTownLabel(notice.town)}
          </span>
        )}
        {notice.closes_on && (
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-300">
            <CalendarClock className="w-4 h-4" aria-hidden="true" />
            Closes {formatDate(notice.closes_on)}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{notice.body}</p>

      {(notice.firm_name || notice.contact) && (
        <p className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-sm text-slate-600">
          <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
          <span>{[notice.firm_name, notice.contact].filter(Boolean).join(' · ')}</span>
        </p>
      )}
    </article>
  );
}
