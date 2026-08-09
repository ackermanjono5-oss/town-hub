'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const supabase = getSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus('sending');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setErrorMessage(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  }

  async function handleGoogleSignIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-muted-foreground">Sign in with Google or your email</p>
      </div>

      {!supabase ? (
        <SupabaseSetupNotice feature="Sign in" />
      ) : status === 'sent' ? (
        <p className="text-center text-sm text-muted-foreground">
          Check your inbox — we sent a magic link to {email}.
        </p>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-md border border-border bg-background hover:bg-secondary transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.6 27 35.5 24 35.5c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9.6 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.6 5.6C39.5 37.5 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {status === 'error' && <p className="text-sm text-danger">{errorMessage}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 transition"
            >
              {status === 'sending' ? 'Sending…' : 'Sign in with magic link'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
