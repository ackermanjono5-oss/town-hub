'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Ticket, Store, X } from 'lucide-react';
import { getCurrentUser, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Invites the visitor to sign in, as a small card that slides up at the
 * bottom of the screen 25 seconds after the app opens.
 *
 * Deliberately restrained, because a pop-up that blocks the page on every
 * launch stops being an invitation and starts being a nag. It doesn't dim or
 * cover the page, so people can carry on reading around it, and it never
 * shows on the /login and /profile pages, where it would be interrupting
 * the very thing it is asking for. It stays away when:
 *
 *  - Supabase is not configured (nothing to sign into)
 *  - the visitor is already signed in
 *  - they dismissed it within the last 7 days
 *  - they are already on the login or profile page
 */

const DELAY_MS = 25_000;
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
  { icon: Ticket, text: 'Member offers' },
  { icon: Store, text: 'Saved places' },
  { icon: Sparkles, text: 'Your profile' },
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
    <aside
      aria-labelledby="signin-prompt-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-sm sm:inset-x-auto sm:right-5 sm:bottom-5 animate-[slideUp_260ms_cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-18px_rgba(10,47,92,0.55)] ring-1 ring-black/5">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 z-10 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        <div className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-[#0a2f5c] via-[#1c6cb8] to-[#31a8c9] px-4 py-3.5 pr-10 text-white">
          <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <span className="relative flex-none w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="relative min-w-0">
            <h2 id="signin-prompt-title" className="text-[16px] font-bold leading-tight">
              Join Town Hub
            </h2>
            <p className="text-[12.5px] text-white/85">Free, and it takes about a minute.</p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5 text-[12.5px] font-medium text-slate-600">
                <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={loginHref}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-center text-sm font-semibold shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              Sign in with email
            </a>
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
