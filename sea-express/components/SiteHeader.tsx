'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  House,
  Newspaper,
  CloudSun,
  Calendar,
  Compass,
  Stethoscope,
  Store,
  BedDouble,
  ShoppingBag,
  Radio,
  Leaf,
  Users,
  Share2,
  LogIn,
  Scale,
  BadgeCheck,
  ScrollText,
  Siren,
  BookOpen,
  Ticket,
  LayoutGrid,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { getCurrentUser, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import DailyDoodle from '@/components/DailyDoodle';
import LogoMark from '@/components/LogoMark';
import { getMyProfile } from '@/lib/rewards/queries';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// The pills always on show: the sections people use most.
const PRIMARY: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/directory', label: 'Restaurants', icon: Compass },
  { href: '/medical', label: 'Medical', icon: Stethoscope },
  { href: '/businesses', label: 'Businesses', icon: Store },
  { href: '/accommodation', label: 'Stay', icon: BedDouble },
  { href: '/weather', label: 'Weather', icon: CloudSun },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/news', label: 'News', icon: Newspaper },
];

// Everything, grouped, for the "More" panel.
const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Directories',
    items: [
      { href: '/directory', label: 'Restaurants', icon: Compass },
      { href: '/medical', label: 'Medical', icon: Stethoscope },
      { href: '/businesses', label: 'Businesses', icon: Store },
      { href: '/accommodation', label: 'Hotels & B&Bs', icon: BedDouble },
      { href: '/attorneys', label: 'Attorneys', icon: Scale },
      { href: '/property', label: 'Property', icon: ShoppingBag },
      { href: '/markets', label: 'Markets', icon: ShoppingBag },
    ],
  },
  {
    title: 'Local info',
    items: [
      { href: '/news', label: 'News', icon: Newspaper },
      { href: '/weather', label: 'Weather', icon: CloudSun },
      { href: '/events', label: 'Events', icon: Calendar },
      { href: '/radio', label: 'Radio', icon: Radio },
      { href: '/nature', label: 'Nature & Blog', icon: Leaf },
      { href: '/sos', label: 'Emergency SOS', icon: Siren },
    ],
  },
  {
    title: 'Community',
    items: [
      { href: '/community', label: 'Community Wall', icon: Users },
      { href: '/social', label: 'Social', icon: Share2 },
      { href: '/legal-notices', label: 'Legal Notices', icon: ScrollText },
      { href: '/guidelines', label: 'Guidelines', icon: BookOpen },
    ],
  },
  {
    title: 'Rewards',
    items: [
      { href: '/rewards', label: 'Member rewards', icon: Ticket },
      { href: '/business', label: 'Business Rewards Portal', icon: BadgeCheck },
    ],
  },
];

const PRIMARY_HREFS = new Set(PRIMARY.map((i) => i.href));
const SECONDARY = GROUPS.flatMap((g) => g.items).filter((i) => !PRIMARY_HREFS.has(i.href));

/**
 * A whole path segment must match, so /businesses doesn't also light up
 * /business. The Android build serves pages from file:// with a .html
 * suffix, so that's stripped first.
 */
function isActive(pathname: string | null, href: string) {
  const path = (pathname ?? '').replace(/\.html$/, '');
  return href === '/' ? path === '/' || path.endsWith('/index') : path.endsWith(href) || path.includes(`${href}/`);
}

const PILL = [
  'flex flex-none items-center gap-1.5 px-3.5 py-2 rounded-full',
  'text-[12.5px] font-bold whitespace-nowrap border',
  'transition-all duration-150 ease-out active:scale-95',
].join(' ');
const PILL_ON = 'bg-[#0e7490] text-white border-[#0e7490] shadow-[0_6px_14px_-8px_rgba(14,116,144,0.9)]';
const PILL_OFF = 'bg-white text-[#1f2937] border-[#e5e7eb] hover:bg-[#f9fafb]';

export default function SiteHeader() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  // On a page that lives under "More", the More pill takes its name, so
  // people can still see where they are.
  const current = SECONDARY.find((i) => isActive(pathname, i.href));

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  // On a phone most of the menu sits off-screen, so the current page's pill
  // is scrolled into view rather than left hidden past the right edge.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  // Starts false so the prerendered header and the first client render
  // agree; the session is only knowable after mount.
  const [signedIn, setSignedIn] = useState(false);
  // Avatar + name for the header button, so a signed-in member sees
  // themselves rather than a generic icon.
  const [me, setMe] = useState<{ avatar: string | null; name: string | null } | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseClient();
    let cancelled = false;

    getCurrentUser().then(async (user) => {
      if (cancelled) return;
      setSignedIn(Boolean(user));
      if (!user) return;
      const profile = await getMyProfile(user.id);
      if (!cancelled) {
        setMe({ avatar: profile?.avatar ?? null, name: profile?.full_name ?? null });
      }
    });

    // Keeps the button in step with signing in or out on another tab or page.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setSignedIn(Boolean(session?.user));
      if (!session?.user) setMe(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] font-[family-name:var(--font-jakarta)]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between px-[18px] pt-1 pb-2.5 border-b border-[#e5e7eb]">
          <div className="flex min-w-0 items-center gap-2.5">
            <a
              href="/"
              aria-label="Town Hub home"
              className="flex-none rounded-[11px] shadow-sm ring-1 ring-black/5 transition-transform duration-200 active:scale-95"
            >
              <LogoMark size={36} className="block" />
            </a>
            <DailyDoodle />
          </div>
          <a
            href={signedIn ? '/profile' : '/login'}
            className="flex flex-none items-center gap-1.5 whitespace-nowrap px-[15px] py-[7px] rounded-full border border-[#e5e7eb] bg-white text-[12.5px] font-semibold text-[#1f2937] transition-all duration-150 hover:bg-[#f9fafb] active:scale-95"
          >
            {signedIn ? (
              <Avatar
                avatarId={me?.avatar}
                name={me?.name}
                size={20}
                className="rounded-md -ml-1"
              />
            ) : (
              <LogIn className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{signedIn ? 'Profile' : 'Sign in'}</span>
          </a>
        </div>
        {/* Scrolls sideways on phones, with the edges faded so it's clear
            there's more. Everything else is one tap away under "More". */}
        <nav
          ref={navRef}
          className="flex gap-[7px] overflow-x-auto px-[18px] py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,#000_18px,#000_calc(100%-28px),transparent)] md:justify-center md:[mask-image:none]"
        >
          {PRIMARY.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <a
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`${PILL} ${active ? PILL_ON : PILL_OFF}`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </a>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-controls="more-menu"
            aria-current={current ? 'page' : undefined}
            className={`${PILL} ${current || moreOpen ? PILL_ON : PILL_OFF}`}
          >
            {current ? (
              <current.icon className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{current ? current.label : 'More'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </nav>
      </div>

      {moreOpen && (
        <>
          {/* Catches taps outside the panel. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 -z-10 cursor-default"
          />
          <div className="absolute inset-x-0 top-full px-3 pt-2">
            <div
              id="more-menu"
              className="doodle-pop mx-auto max-w-5xl rounded-3xl bg-white p-4 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.5)] ring-1 ring-black/5 sm:p-5"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                {GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f3d5e]">
                      {group.title}
                    </p>
                    <ul className="space-y-0.5">
                      {group.items.map(({ href, label, icon: Icon }) => {
                        const active = isActive(pathname, href);
                        return (
                          <li key={href}>
                            <a
                              href={href}
                              aria-current={active ? 'page' : undefined}
                              className={[
                                'flex items-center gap-2 rounded-xl px-2 py-1.5 text-[13px] font-semibold transition',
                                active ? 'bg-[#e0f2fe] text-[#0e7490]' : 'text-slate-700 hover:bg-slate-100',
                              ].join(' ')}
                            >
                              <Icon className="h-4 w-4 flex-none" aria-hidden="true" />
                              <span className="leading-tight">{label}</span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
