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
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Sign in to view and redeem local rewards.</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
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
