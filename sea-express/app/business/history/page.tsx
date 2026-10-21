'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';
import { listMyRedemptions } from '@/lib/business/queries';
import type { BusinessRedemptionRow } from '@/lib/business/types';
import { formatDateTime, formatPeriod, formatVoucherCode } from '@/lib/rewards/voucher';

export default function BusinessHistoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/business"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Business Rewards Portal
      </a>
      <RequireBusiness>{({ business }) => <History businessId={business.id} />}</RequireBusiness>
    </div>
  );
}

function History({ businessId }: { businessId: string }) {
  const [rows, setRows] = useState<BusinessRedemptionRow[] | null>(null);

  useEffect(() => {
    listMyRedemptions(businessId).then(setRows);
  }, [businessId]);

  const byMonth = useMemo(() => {
    const groups = new Map<string, BusinessRedemptionRow[]>();
    for (const row of rows ?? []) groups.set(row.period, [...(groups.get(row.period) ?? []), row]);
    return [...groups.entries()];
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Redemption history</h1>
        <p className="text-sm text-muted-foreground">Every voucher redeemed at your business.</p>
      </div>

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground p-6 text-center rounded-xl border border-dashed border-border">
          No vouchers redeemed yet.
        </p>
      ) : (
        byMonth.map(([period, list]) => (
          <section key={period} className="space-y-2">
            <h2 className="flex items-baseline justify-between font-semibold">
              {formatPeriod(period)}
              <span className="text-sm font-normal text-muted-foreground">
                {list.length} {list.length === 1 ? 'redemption' : 'redemptions'}
              </span>
            </h2>
            <ul className="divide-y divide-border rounded-xl border border-border bg-background">
              {list.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>
                    <span className="block font-medium">{r.offer?.title ?? 'Reward'}</span>
                    <span className="block text-xs text-muted-foreground">{formatDateTime(r.redeemed_at)}</span>
                  </span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {formatVoucherCode(r.token?.code)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
