'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_MODE } from '@/lib/rewards/demo';
import type { TokenStatus } from '@/lib/rewards/types';
import { formatDateTime, formatVoucherCode } from '@/lib/rewards/voucher';

interface QRDisplayProps {
  tokenId: string;
  qrToken: string;
  status: TokenStatus;
  expiresAt: string;
  /** The voucher code staff type in (real vouchers). */
  code?: string;
  /** Demo builds show the printed coupon code alongside the QR. */
  couponCode?: string;
}

function formatCountdown(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const STATUS_STYLES: Record<TokenStatus, { label: string; className: string }> = {
  available: { label: 'AVAILABLE', className: 'bg-white text-[#c2410c] shadow-sm' },
  used: { label: 'ALREADY USED', className: 'bg-white text-[#2f6b3a] shadow-sm' },
  expired: { label: 'EXPIRED', className: 'bg-white/90 text-slate-700 shadow-sm' },
};

export default function QRDisplay({
  tokenId,
  qrToken,
  status: initialStatus,
  expiresAt,
  code,
  couponCode,
}: QRDisplayProps) {
  const [status, setStatus] = useState<TokenStatus>(initialStatus);
  const [msRemaining, setMsRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now());

  // Local countdown — flips to EXPIRED client-side once the token's TTL
  // passes, independent of any server round-trip.
  useEffect(() => {
    if (status !== 'available') return;
    const interval = setInterval(() => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setMsRemaining(remaining);
      if (remaining <= 0) {
        setStatus('expired');
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  // Live status: once a (future) business-app scan flips this row to
  // 'used' in the DB, this screen updates without any user action.
  useEffect(() => {
    // Demo builds run fully offline — there's no backend to push status
    // changes, so don't open a websocket that can never connect.
    if (DEMO_MODE) return;

    const supabase = getSupabaseClient();
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel(`redemption-token-${tokenId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'redemption_tokens', filter: `id=eq.${tokenId}` },
        (payload) => {
          const newStatus = (payload.new as { status?: TokenStatus }).status;
          if (newStatus) setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tokenId]);

  const style = STATUS_STYLES[status];

  const available = status === 'available';

  return (
    // A ticket: coloured face with the code, a tear line with notches, and
    // a white stub with the QR. --notch-y lines the notches up with the
    // tear line under the face.
    <div className="ticket [--notch-y:150px] drop-shadow-[0_18px_28px_rgba(15,23,42,0.22)]">
      <div
        className={`relative h-[150px] overflow-hidden rounded-t-3xl px-6 pt-5 text-white bg-gradient-to-br ${
          available
            ? 'from-[#7a2e0e] via-[#e0662b] to-[#f6b44b]'
            : status === 'used'
              ? 'from-[#14321f] via-[#2f6b3a] to-[#7a9a2e]'
              : 'from-[#334155] via-[#475569] to-[#94a3b8]'
        }`}
      >
        <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
        <div className="relative flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.16em] ${style.className}`}>
            {style.label}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Town Hub voucher</span>
        </div>
        {code || couponCode ? (
          <div className="relative mt-4 text-center">
            <p className="text-xs text-white/80">{available ? 'Show this code at the till' : 'Voucher code'}</p>
            {/* Real codes are 8 characters (K7PM-3QXH); demo coupon codes
                are longer, so they get a smaller size to stay on one line. */}
            <p
              className={`mt-1 font-mono font-black drop-shadow-sm whitespace-nowrap ${
                (code ? formatVoucherCode(code) : couponCode ?? '').length > 10
                  ? 'text-[22px] tracking-[0.08em]'
                  : 'text-[34px] tracking-[0.18em]'
              }`}
            >
              {code ? formatVoucherCode(code) : couponCode}
            </p>
          </div>
        ) : null}
      </div>

      <div className="relative rounded-b-3xl bg-white px-6 pt-6 pb-6">
        <div className="absolute -top-px left-5 right-5 border-t-2 border-dashed border-slate-200" aria-hidden="true" />

        {available ? (
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-white rounded-2xl ring-1 ring-slate-100 shadow-sm">
              <QRCodeSVG value={qrToken} size={code ? 176 : 216} />
            </div>
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <Clock className="w-4 h-4 text-[#e0662b]" aria-hidden="true" />
              {msRemaining > 60 * 60 * 1000
                ? `Valid until ${formatDateTime(expiresAt)}`
                : `Expires in ${formatCountdown(msRemaining)}`}
            </p>
          </div>
        ) : status === 'used' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border-[3px] border-[#2f6b3a] text-[#2f6b3a] text-xl font-black tracking-[0.2em] rotate-[-6deg]">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              REDEEMED
            </span>
            <p className="text-sm text-slate-600">Enjoy! This voucher has been used.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <XCircle className="w-10 h-10 text-slate-400" aria-hidden="true" />
            <p className="text-sm text-slate-600">
              This voucher has expired. Tap &ldquo;Redeem Now&rdquo; again for a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
