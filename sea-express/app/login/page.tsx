'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import HelpEmail from '@/components/HelpEmail';
import { MEMBER_REGISTRATIONS_EMAIL } from '@/lib/contact';
import { APP_AUTH_REDIRECT, isFileProtocol } from '@/lib/auth-callback';

/**
 * Email sign-in sends a one-time code that's verified right here, which
 * works the same on the web and in the Android app.
 *
 * Redirect-based sign-in (Google, and the link in the sign-in email) can't
 * come back to the Android app's file:// pages, and Google refuses to sign
 * in inside embedded WebViews. So in the app both open in the phone's
 * browser and return through the townhub://auth/callback link, which
 * App.js passes to AuthCallbackBridge (see lib/auth-callback.ts). On the web
 * they redirect back to the site as usual.
 */

type Step = 'email' | 'code' | 'done';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Known only in the browser, so it starts false to match the prerendered
  // HTML and is set after mount.
  const [inApp, setInApp] = useState(false);
  useEffect(() => {
    setInApp(isFileProtocol());
  }, []);

  const supabase = getSupabaseClient();

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      // If the email has a link rather than (or as well as) the code,
      // tapping it on the phone opens the app signed in.
      options: { shouldCreateUser: true, ...(inApp ? { emailRedirectTo: APP_AUTH_REDIRECT } : {}) },
    });
    setBusy(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStep('code');
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMessage('');
    const token = code.trim();

    // A first-time address gets the "Confirm signup" email and a signup
    // token; an existing one gets "Magic Link" and an email token. Which
    // type /verify accepts varies by GoTrue version, so try the common case
    // and fall back rather than making the user care which they are.
    let { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) {
      const retry = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
      if (!retry.error) error = null;
    }

    setBusy(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setStep('done');
  }

  async function handleGoogleSignIn() {
    setErrorMessage('');
    if (!inApp) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) setErrorMessage(error.message);
      return;
    }
    // In the app: get Google's sign-in address without navigating, then open
    // it. App.js sends it to the phone's browser, and Google returns to the
    // app through APP_AUTH_REDIRECT.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: APP_AUTH_REDIRECT, skipBrowserRedirect: true },
    });
    if (error || !data?.url) {
      setErrorMessage(error?.message ?? 'Could not start Google sign-in.');
      return;
    }
    window.location.href = data.url;
  }

  // Absolute '/' is rewritten to index.html by scripts/relativize-export.mjs,
  // but only inside prerendered markup — this link is created at runtime, so
  // it has to resolve its own href.
  const homeHref = isFileProtocol() ? 'index.html' : '/';

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <div className="overflow-hidden rounded-3xl bg-card shadow-[0_24px_48px_-28px_rgba(10,47,92,0.7)] ring-1 ring-white/70 dark:ring-white/10">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2f5c] via-[#1569a8] to-[#2fb2cf] px-6 pt-8 pb-12 text-center text-white">
        <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
        <div className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt=""
          width={64}
          height={64}
          className="relative mx-auto w-16 h-16 rounded-2xl ring-2 ring-white/40 shadow-lg"
        />
        <h1 className="relative mt-4 text-2xl font-extrabold tracking-tight">
          {step === 'code' ? 'Check your email' : 'Welcome to Town Hub'}
        </h1>
        <p className="relative mt-1.5 text-sm text-white/85">
          {step === 'code'
            ? `We emailed ${email}. Enter the 6-digit code, or tap the link in the email on this phone.`
            : 'Sign in with Google or your email address'}
        </p>
        <svg className="absolute bottom-0 left-0 w-full h-6 text-card" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,40 C240,80 480,0 720,32 C960,64 1200,8 1440,36 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <div className="px-6 pb-7 pt-3">
      {!isSupabaseConfigured ? (
        <SupabaseSetupNotice feature="Sign in" />
      ) : step === 'done' ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">You&apos;re signed in.</p>
          <a
            href={homeHref}
            className="inline-block w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Continue
          </a>
        </div>
      ) : step === 'code' ? (
        <form onSubmit={verifyCode} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-2">
              6-digit code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-2 rounded-md border border-border bg-background tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
          <button
            type="submit"
            disabled={busy || code.length < 6}
            className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-[#1569a8] to-[#2fb2cf] text-white font-semibold shadow-lg shadow-sky-700/25 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {busy ? 'Checking…' : 'Verify and sign in'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('email');
              setCode('');
              setErrorMessage('');
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition"
          >
            Use a different email
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-border bg-background font-medium hover:bg-secondary transition"
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

          <form onSubmit={sendCode} className="space-y-4">
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {errorMessage && <p className="text-sm text-danger">{errorMessage}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-[#1569a8] to-[#2fb2cf] text-white font-semibold shadow-lg shadow-sky-700/25 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 transition"
            >
              {busy ? 'Sending…' : 'Email me a sign-in code'}
            </button>
          </form>
        </div>
      )}
      </div>
      </div>
      <HelpEmail prompt="Trouble registering? Email us at" email={MEMBER_REGISTRATIONS_EMAIL} className="mt-5" />
    </div>
  );
}
