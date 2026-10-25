'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
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
  type LucideIcon,
} from 'lucide-react';
import { getCurrentUser, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Avatar from '@/components/Avatar';
import DailyDoodle from '@/components/DailyDoodle';
import { getMyProfile } from '@/lib/rewards/queries';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: House },
  { href: '/directory', label: 'Restaurants', icon: Compass },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/weather', label: 'Weather', icon: CloudSun },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/medical', label: 'Medical', icon: Stethoscope },
  { href: '/attorneys', label: 'Attorneys', icon: Scale },
  { href: '/legal-notices', label: 'Notices', icon: ScrollText },
  { href: '/business', label: 'Rewards Portal', icon: BadgeCheck },
  { href: '/businesses', label: 'Businesses', icon: Store },
  { href: '/accommodation', label: 'Stay', icon: BedDouble },
  { href: '/property', label: 'Property', icon: ShoppingBag },
  { href: '/radio', label: 'Radio', icon: Radio },
  { href: '/nature', label: 'Nature', icon: Leaf },
  { href: '/markets', label: 'Markets', icon: ShoppingBag },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/social', label: 'Social', icon: Share2 },
];

export default function SiteHeader() {
  const pathname = usePathname();

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
            <a href="/" className="flex-none transition-transform duration-200 active:scale-95">
              <Image
                src="/icon.png"
                alt="Town Hub home"
                width={36}
                height={36}
                className="w-9 h-9 rounded-[11px] shadow-sm ring-1 ring-black/5"
              />
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
            there's more; on wide screens every pill fits, wrapped and centred. */}
        <nav
          ref={navRef}
          className="flex gap-[7px] overflow-x-auto px-[18px] py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,transparent,#000_18px,#000_calc(100%-28px),transparent)] lg:flex-wrap lg:justify-center lg:overflow-visible lg:[mask-image:none]"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            // A whole path segment must match, so /businesses doesn't also
            // light up /business. The Android build serves pages from
            // file:// with a .html suffix, so that's stripped first.
            const path = (pathname ?? '').replace(/\.html$/, '');
            const isActive =
              href === '/' ? path === '/' || path.endsWith('/index') : path.endsWith(href) || path.includes(`${href}/`);
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex flex-none items-center gap-1.5 px-3.5 py-2 rounded-full',
                  'text-[12.5px] font-bold whitespace-nowrap border',
                  'transition-all duration-150 ease-out active:scale-95',
                  isActive
                    ? 'bg-[#0e7490] text-white border-[#0e7490] shadow-[0_6px_14px_-8px_rgba(14,116,144,0.9)]'
                    : 'bg-white text-[#1f2937] border-[#e5e7eb] hover:bg-[#f9fafb]',
                ].join(' ')}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
