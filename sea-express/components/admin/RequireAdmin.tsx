'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/client';
import { getMyProfile } from '@/lib/rewards/queries';

// Client-side-only gating — matches this app's existing security model
// (RLS's is_admin() policies are the real enforcement layer, not route
// protection). Server-side session checks (@supabase/ssr + middleware.ts)
// would be the production-hardened version of this, but the app has zero
// server-side session handling anywhere today, so adding that is
// infrastructure disproportionate to this pass.
export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // getCurrentUser reads the stored session. getUser() revalidates
      // against the Auth server, so offline — the normal state for this
      // app — it never settles and the gate sits on its loading state.
      const user = await getCurrentUser();
      if (!user) {
        router.replace('/');
        return;
      }
      const profile = await getMyProfile(user.id);
      if (cancelled) return;
      if (profile?.role === 'admin') {
        setAllowed(true);
      } else {
        router.replace('/');
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return <p className="text-sm text-muted-foreground text-center py-12">Checking access…</p>;
  }

  return <>{children}</>;
}
