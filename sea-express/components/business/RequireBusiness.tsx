'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabase/client';
import { getMyProfile } from '@/lib/rewards/queries';
import { getMyBusiness } from '@/lib/business/queries';
import type { Business } from '@/lib/rewards/types';

type GateState = 'loading' | 'signed-out' | 'not-business' | 'pending' | 'ready';

export default function RequireBusiness({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('loading');
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
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

      if (profile?.role !== 'business_owner') {
        setState('not-business');
        return;
      }

      const biz = await getMyBusiness(user.id);
      if (cancelled) return;
      setBusiness(biz);
      setState(biz?.is_active ? 'ready' : 'pending');
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return <p className="text-sm text-muted-foreground text-center py-12">Checking access…</p>;
  }

  if (state === 'signed-out') {
    return (
      <div className="max-w-sm mx-auto py-12 text-center">
        <p className="text-muted-foreground mb-4">Sign in to access your business account.</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          Sign In
        </a>
      </div>
    );
  }

  if (state === 'not-business') {
    return (
      <div className="max-w-sm mx-auto py-12 text-center">
        <p className="text-muted-foreground mb-4">This account isn&rsquo;t linked to a business yet.</p>
        <a
          href="/business/register"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          Register Your Business
        </a>
      </div>
    );
  }

  if (state === 'pending') {
    return (
      <div className="max-w-sm mx-auto py-12 text-center">
        <p className="font-semibold mb-2">{business?.name}</p>
        <p className="text-muted-foreground">
          Your business is pending approval. We&rsquo;ll notify you once it&rsquo;s live — check back soon.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
