'use client';

import { useEffect, useState } from 'react';
import { listBusinesses, listRedemptionsAdmin } from '@/lib/admin/queries';
import type { AdminRedemptionRow, BusinessWithOwner } from '@/lib/admin/types';

export default function AdminRedemptionsPage() {
  const [businesses, setBusinesses] = useState<BusinessWithOwner[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [month, setMonth] = useState(''); // 'YYYY-MM' from <input type="month">
  const [rows, setRows] = useState<AdminRedemptionRow[] | null>(null);

  useEffect(() => {
    listBusinesses().then(setBusinesses);
  }, []);

  useEffect(() => {
    const period = month ? `${month}-01` : undefined;
    listRedemptionsAdmin({ businessId: businessId || undefined, period }).then(setRows);
  }, [businessId, month]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Redemptions</h1>
        <p className="text-muted-foreground">All reward redemptions across every business.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-background"
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-background"
        />
      </div>

      {rows === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No redemptions match these filters.</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-background">
              <div>
                <p className="text-sm font-medium">
                  {row.business?.name ?? 'Business'} — {row.offer?.title ?? 'Offer'}
                </p>
                <p className="text-xs text-muted-foreground">{row.customer?.full_name ?? 'Customer'}</p>
              </div>
              <p className="text-xs text-muted-foreground shrink-0">{new Date(row.redeemed_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
