'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_MODE } from '@/lib/rewards/demo';
import type { TokenStatus } from '@/lib/rewards/types';

interface QRDisplayProps {
  tokenId: string;
  qrToken: string;
  status: TokenStatus;
  expiresAt: string;
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
  available: { label: 'AVAILABLE', className: 'bg-primary text-primary-foreground' },
  used: { label: 'ALREADY USED', className: 'bg-danger text-danger-foreground' },
  expired: { label: 'EXPIRED', className: 'bg-danger text-danger-foreground' },
};

export default function QRDisplay({
  tokenId,
  qrToken,
  status: initialStatus,
  expiresAt,
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

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border bg-background">
      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${style.className}`}>
        {style.label}
      </span>

      {status === 'available' ? (
        <>
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG value={qrToken} size={220} />
          </div>
          {couponCode && (
            <p className="font-mono text-sm font-semibold tracking-widest">{couponCode}</p>
          )}
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" aria-hidden="true" />
            Expires in {formatCountdown(msRemaining)}
          </p>
        </>
      ) : status === 'used' ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 className="w-10 h-10 text-danger" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">This reward has already been redeemed.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <XCircle className="w-10 h-10 text-danger" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            This code has expired. Tap &ldquo;Redeem Now&rdquo; again for a new one.
          </p>
        </div>
      )}
    </div>
  );
}
