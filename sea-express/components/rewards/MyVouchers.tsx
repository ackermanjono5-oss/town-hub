'use client';

import { useEffect, useState } from 'react';
import { listMyVouchers } from '@/lib/rewards/queries';
import type { RedemptionToken } from '@/lib/rewards/types';
import { formatDateTime, formatVoucherCode } from '@/lib/rewards/voucher';

type VoucherState = 'Active' | 'Redeemed' | 'Expired';

function voucherState(v: RedemptionToken, now = Date.now()): VoucherState {
  if (v.status === 'used') return 'Redeemed';
  if (v.status === 'expired' || new Date(v.expires_at).getTime() < now) return 'Expired';
  return 'Active';
}

const STATE_STYLES: Record<VoucherState, string> = {
  Active: 'bg-emerald-100 text-emerald-800',
  Redeemed: 'bg-slate-200 text-slate-700',
  Expired: 'bg-rose-100 text-rose-800',
};

/** The member's vouchers and what happened to each, newest first. */
export default function MyVouchers() {
  const [vouchers, setVouchers] = useState<RedemptionToken[] | null>(null);

  useEffect(() => {
    listMyVouchers().then(setVouchers);
  }, []);

  if (!vouchers || vouchers.length === 0) return null;

  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-xl font-bold">My vouchers</h2>
      <ul className="divide-y divide-border rounded-xl border border-border bg-background">
        {vouchers.map((v) => {
          const state = voucherState(v);
          return (
            <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <a href={`/rewards/offer?id=${v.offer_id}`} className="min-w-0">
                <span className="block font-medium truncate">{v.offer_title ?? 'Reward'}</span>
                <span className="block text-xs text-muted-foreground">
                  {state === 'Redeemed'
                    ? `Redeemed ${formatDateTime(v.used_at)}`
                    : state === 'Active'
                      ? `Valid until ${formatDateTime(v.expires_at)}`
                      : `Issued ${formatDateTime(v.issued_at)}`}
                </span>
              </a>
              <span className="flex flex-col items-end gap-1 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATE_STYLES[state]}`}>{state}</span>
                {v.code && (
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">{formatVoucherCode(v.code)}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
