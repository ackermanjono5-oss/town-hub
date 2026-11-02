'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { parseAuthCallback } from '@/lib/auth-callback';
import { navigateTo } from '@/lib/app-nav';

declare global {
  interface Window {
    __townhubAuthCallback?: (url: string) => void;
    __townhubPendingAuth?: string;
  }
}

/**
 * Receives townhub://auth/callback links from the Android app (see
 * lib/auth-callback.ts) and turns them into a signed-in session, then opens
 * the profile page. The app may deliver a link before React has mounted, so
 * it also leaves it in window.__townhubPendingAuth for this to pick up.
 * Renders nothing except a short message while signing in or on failure.
 */
export default function AuthCallbackBridge() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function handle(url: string) {
      window.__townhubPendingAuth = undefined;
      const result = parseAuthCallback(url);
      if (!result) return;
      if (result.kind === 'error') {
        setMessage(`Sign-in didn't finish: ${result.message}`);
        return;
      }
      setMessage('Signing you in…');
      const { error } =
        result.kind === 'tokens'
          ? await supabase.auth.setSession({ access_token: result.accessToken, refresh_token: result.refreshToken })
          : await supabase.auth.exchangeCodeForSession(result.code);
      if (error) {
        setMessage(`Sign-in didn't finish: ${error.message}`);
        return;
      }
      navigateTo('/profile');
    }

    window.__townhubAuthCallback = (url) => {
      void handle(url);
    };
    if (window.__townhubPendingAuth) void handle(window.__townhubPendingAuth);
    return () => {
      window.__townhubAuthCallback = undefined;
    };
  }, []);

  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-3 top-3 z-[70] mx-auto max-w-sm rounded-2xl bg-card px-4 py-3 text-center text-sm font-medium text-ink shadow-lg ring-1 ring-black/5"
    >
      {message}
      {message.startsWith('Sign-in') && (
        <button type="button" onClick={() => setMessage(null)} className="ml-2 text-primary underline">
          OK
        </button>
      )}
    </div>
  );
}
