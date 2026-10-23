'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Clock, LogIn, ShieldAlert, Store, XCircle } from 'lucide-react';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import {
  getMyBusinessMembership,
  isBusinessEligible,
  resubmitApplication,
  type BusinessMembership,
} from '@/lib/business/queries';

type GateState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'no-business' }
  | { kind: 'not-ready'; membership: BusinessMembership }
  | { kind: 'ready'; membership: BusinessMembership };

const BUTTON =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]';
const BUTTON_GHOST =
  'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border bg-background hover:bg-secondary transition';

/**
 * Access control for the Business Rewards Portal. Ordinary customers are told
 * what the portal is and how a business joins; applicants see where their
 * application stands; only approved, paying businesses reach the tools.
 *
 * This only decides what the screen shows. The real enforcement is server
 * side: RLS, the guard triggers and redeem_voucher() in migration 0011.
 */
export default function RequireBusiness({
  children,
  ownerOnly = false,
}: {
  children: (membership: BusinessMembership) => React.ReactNode;
  /** Offer management is for the owner; staff can only verify vouchers. */
  ownerOnly?: boolean;
}) {
  const [state, setState] = useState<GateState>({ kind: 'loading' });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function check() {
      // getCurrentUser reads the stored session. getUser() revalidates
      // against the Auth server, so offline — the normal state for this
      // app — it never settles and the gate sits on its loading state.
      const user = await getCurrentUser();
      if (!user) {
        if (!cancelled) setState({ kind: 'signed-out' });
        return;
      }
      const membership = await getMyBusinessMembership(user.id);
      if (cancelled) return;
      if (!membership) setState({ kind: 'no-business' });
      else if (isBusinessEligible(membership.business)) setState({ kind: 'ready', membership });
      else setState({ kind: 'not-ready', membership });
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) {
    return <SupabaseSetupNotice feature="the Business Rewards Portal" />;
  }

  if (state.kind === 'loading') {
    return <p className="text-sm text-muted-foreground text-center py-12">Checking access…</p>;
  }

  if (state.kind === 'signed-out' || state.kind === 'no-business') {
    return (
      <PortalIntro>
        {state.kind === 'signed-out' ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/login" className={BUTTON}>
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Business sign in
            </a>
            <a href="/business/register" className={BUTTON_GHOST}>
              Register your business for loyalty rewards
            </a>
          </div>
        ) : (
          <a href="/business/register" className={BUTTON}>
            <Store className="w-4 h-4" aria-hidden="true" />
            Register your business for loyalty rewards
          </a>
        )}
      </PortalIntro>
    );
  }

  if (state.kind === 'not-ready') {
    return <ApplicationStatus membership={state.membership} />;
  }

  if (ownerOnly && state.membership.role !== 'owner') {
    return (
      <StatusCard icon={ShieldAlert} tone="amber" title="Owner access only">
        Only the business owner can manage reward offers. Staff accounts can verify and redeem
        vouchers.
      </StatusCard>
    );
  }

  return <>{children(state.membership)}</>;
}

function PortalIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14321f] via-[#2f6b3a] to-[#84a83a] px-6 pt-7 pb-8 text-center text-white shadow-[0_20px_40px_-22px_rgba(20,50,31,0.9)]">
        <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
        <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-[#ffd27a]/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#ffd27a] text-[#14321f] flex items-center justify-center shadow-lg rotate-[-6deg]">
          <BadgeCheck className="w-9 h-9" aria-hidden="true" />
        </div>
        <h2 className="relative mt-4 text-2xl font-extrabold tracking-tight">Business Rewards Portal</h2>
        <p className="relative mt-2 text-sm text-white/85">
          This portal is for registered Town Hub advertising businesses. Approved businesses use it
          to manage their monthly loyalty rewards and to verify and redeem customer vouchers.
        </p>
      </div>
      <div className="text-center">{children}</div>
      <p className="text-xs text-center text-muted-foreground">
        Looking for rewards as a customer? Open{' '}
        <a href="/rewards" className="text-primary underline">
          Rewards
        </a>
        .
      </p>
    </div>
  );
}

const TONES = {
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
  sky: 'bg-sky-50 border-sky-200 text-sky-900',
};

function StatusCard({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: typeof Clock;
  tone: keyof typeof TONES;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`max-w-md mx-auto rounded-2xl border p-6 space-y-3 ${TONES[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" aria-hidden="true" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="text-sm space-y-3">{children}</div>
    </div>
  );
}

/** Where a business that isn't (yet) eligible stands, and what to do next. */
function ApplicationStatus({ membership }: { membership: BusinessMembership }) {
  const { business, role } = membership;
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = business.trading_name || business.registered_name || business.name;

  async function handleResubmit() {
    setResubmitting(true);
    setError(null);
    try {
      await resubmitApplication();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resubmit. Please try again.');
      setResubmitting(false);
    }
  }

  if (business.approval_status === 'pending') {
    return (
      <StatusCard icon={Clock} tone="sky" title="Application received">
        <p>
          <strong>{name}</strong>&rsquo;s registration for Town Hub loyalty rewards is waiting for
          Town Hub to review it. Submitting an application does not activate rewards access — you
          can use the portal once Town Hub approves it and confirms your advertising subscription.
        </p>
        {role === 'owner' && (
          <a href="/business/register" className="inline-block text-primary underline">
            View or update your application
          </a>
        )}
      </StatusCard>
    );
  }

  if (business.approval_status === 'denied') {
    return (
      <StatusCard icon={XCircle} tone="rose" title="Application not approved">
        <p>
          Town Hub did not approve <strong>{name}</strong>&rsquo;s registration
          {business.approval_note ? ':' : '.'}
        </p>
        {business.approval_note && <p className="italic">&ldquo;{business.approval_note}&rdquo;</p>}
        {role === 'owner' && (
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a href="/business/register" className={BUTTON_GHOST}>
              Update details
            </a>
            <button type="button" onClick={handleResubmit} disabled={resubmitting} className={BUTTON}>
              {resubmitting ? 'Resubmitting…' : 'Resubmit application'}
            </button>
          </div>
        )}
        {error && <p className="text-danger">{error}</p>}
      </StatusCard>
    );
  }

  if (business.approval_status === 'suspended') {
    return (
      <StatusCard icon={ShieldAlert} tone="rose" title="Rewards access suspended">
        <p>
          Town Hub has suspended <strong>{name}</strong>&rsquo;s access to the loyalty rewards
          programme
          {business.approval_note ? `: ${business.approval_note}` : '.'}
        </p>
        <p>
          Contact Town Hub at{' '}
          <a href="mailto:info@seaexpress.co.za" className="underline">
            info@seaexpress.co.za
          </a>
          .
        </p>
      </StatusCard>
    );
  }

  // Approved, but the paid advertising subscription isn't active.
  const lapsed = business.advertiser_status === 'expired' || Boolean(business.advertising_paid_until);
  return (
    <StatusCard icon={ShieldAlert} tone="amber" title="Advertising subscription required">
      <p>
        Loyalty rewards are available to Town Hub&rsquo;s paying advertising clients.{' '}
        {business.advertiser_status === 'needs_verification'
          ? 'Town Hub is still verifying your advertising subscription.'
          : lapsed
            ? `${name}'s advertising subscription has expired, so its rewards are paused.`
            : `${name} is not yet a Town Hub advertiser.`}
      </p>
      <p>
        To advertise or renew, contact Town Hub at{' '}
        <a href="mailto:info@seaexpress.co.za" className="underline">
          info@seaexpress.co.za
        </a>
        .
      </p>
    </StatusCard>
  );
}
