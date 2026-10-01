'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Ticket, Store, X } from 'lucide-react';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Invites the visitor to sign in ten seconds after the app opens.
 *
 * Deliberately restrained about when it appears, because a modal that
 * interrupts every launch stops being an invitation and starts being a
 * nag — and on the /login and /profile pages it would be interrupting the
 * very thing it is asking for. It stays away when:
 *
 *  - Supabase is not configured (nothing to sign into)
 *  - the visitor is already signed in
 *  - they dismissed it within the last 7 days
 *  - they are already on the login or profile page
 */

const DELAY_MS = 10_000;
const SNOOZE_KEY = 'townhub:signin-prompt-dismissed';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

// file:// has no origin and localStorage can throw there, or in a private
// window; a prompt is not worth breaking a page over.
function snoozedUntil(): number {
  try {
    return Number(window.localStorage.getItem(SNOOZE_KEY) ?? 0);
  } catch {
    return 0;
  }
}

function snooze() {
  try {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* ignore — dismissal just won't persist */
  }
}

const PERKS = [
  { icon: Ticket, text: 'Member-only offers from local businesses' },
  { icon: Store, text: 'Save the places you want to come back to' },
  { icon: Sparkles, text: 'Your own Town Hub profile' },
];

export default function SignInPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const path = window.location.pathname;
    if (/(^|\/)(login|profile)(\.html)?$/.test(path)) return;
    if (Date.now() < snoozedUntil()) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const user = await getCurrentUser();
      if (!cancelled && !user) setOpen(true);
    }, DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!open) return null;

  const loginHref = window.location.protocol === 'file:' ? 'login.html' : '/login';

  function dismiss() {
    snooze();
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-prompt-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-[slideUp_260ms_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2f5c] via-[#1c6cb8] to-[#31a8c9] px-6 pt-8 pb-7 text-white text-center">
          <div
            className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/25 flex items-center justify-center">
              <Sparkles className="w-7 h-7" aria-hidden="true" />
            </div>
            <h2 id="signin-prompt-title" className="mt-4 text-2xl font-bold tracking-tight">
              Join Town Hub
            </h2>
            <p className="mt-1.5 text-sm text-white/80">
              Free, and it takes about a minute.
            </p>
          </div>
        </div>

        <div className="p-6">
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <a
            href={loginHref}
            className="mt-6 block w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground text-center font-semibold shadow-sm hover:brightness-110 active:scale-95 transition"
          >
            Sign in with email
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="mt-2 w-full px-4 py-2.5 text-sm text-slate-500 hover:text-slate-800 transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
