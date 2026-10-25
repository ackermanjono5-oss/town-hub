'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured, getCurrentUser } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import { getMyProfile } from '@/lib/rewards/queries';
import { DEMO_MODE } from '@/lib/rewards/demo';
import MembershipNotice from './MembershipNotice';

type GateState = 'loading' | 'signed-out' | 'not-subscribed' | 'ready';

export default function RewardsGate({ children }: { children: React.ReactNode }) {
  // Demo builds (the offline mockup APK) have no backend to authenticate
  // against, so the gate opens straight away.
  const [state, setState] = useState<GateState>(DEMO_MODE ? 'ready' : 'loading');
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (DEMO_MODE) return;
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function check() {
      // getCurrentUser reads the stored session. getUser() revalidates
      // against the Auth server, so offline — the normal state for this
      // app — it never settles and the gate sits on its loading state.
      const user = await getCurrentUser();

      if (!user) {
        if (!cancelled) setState('signed-out');
        return;
      }

      const profile = await getMyProfile(user.id);
      if (cancelled) return;
      setState(profile?.is_subscribed ? 'ready' : 'not-subscribed');
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (!isSupabaseConfigured) {
    return <SupabaseSetupNotice feature="Rewards" />;
  }

  if (state === 'loading') {
    return <p className="text-sm text-muted-foreground text-center py-8">Loading rewards…</p>;
  }

  if (state === 'signed-out') {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-card/85 backdrop-blur px-6 py-10 text-center shadow-[0_14px_34px_-20px_rgba(15,23,42,0.45)] ring-1 ring-white/70 dark:ring-white/10">
        <div className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-amber-200/50 dark:bg-amber-400/15 blur-3xl" aria-hidden="true" />
        {/* A little fan of coupons. */}
        <div className="relative mx-auto mb-6 h-20 w-40" aria-hidden="true">
          <span className="absolute left-2 top-3 h-14 w-24 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#3f36b5] rotate-[-14deg] shadow-md" />
          <span className="absolute right-2 top-3 h-14 w-24 rounded-xl bg-gradient-to-br from-[#4cc3dd] to-[#155f9c] rotate-[14deg] shadow-md" />
          <span className="absolute left-1/2 top-0 h-16 w-28 -translate-x-1/2 rounded-xl bg-gradient-to-br from-[#f6b44b] to-[#d9532a] shadow-lg flex items-center justify-center text-white text-xl font-black">
            2 for 1
          </span>
        </div>
        <p className="relative text-xl font-extrabold text-slate-900">Local deals, just for members</p>
        <p className="relative mt-2 text-slate-600">Sign in to see this month&rsquo;s rewards and get your vouchers.</p>
        <a
          href="/login"
          className="relative mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#e0662b] to-[#f6b44b] text-white font-semibold shadow-lg shadow-orange-500/30 hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (state === 'not-subscribed') {
    return <MembershipNotice />;
  }

  return <>{children}</>;
}
