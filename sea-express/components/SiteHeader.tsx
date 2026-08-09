'use client';

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
  type LucideIcon,
} from 'lucide-react';

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
  { href: '/businesses', label: 'Businesses', icon: Store },
  { href: '/accommodation', label: 'Hotels & B&Bs', icon: BedDouble },
  { href: '/property', label: 'Property', icon: ShoppingBag },
  { href: '/radio', label: 'Radio', icon: Radio },
  { href: '/nature', label: 'Nature', icon: Leaf },
  { href: '/markets', label: 'Markets', icon: ShoppingBag },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/social', label: 'Social', icon: Share2 },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <a
            href="/"
            className="flex items-center gap-2.5 font-bold text-lg transition-transform duration-200 hover:scale-[1.02] active:scale-95"
          >
            <Image
              src="/icon.png"
              alt="Town Hub logo"
              width={36}
              height={36}
              className="w-9 h-9 rounded-xl shadow-sm ring-1 ring-black/5"
            />
            <span className="text-foreground tracking-tight">Town Hub</span>
          </a>
          <a
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign in</span>
          </a>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap',
                  'transition-all duration-200 ease-out active:scale-95',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
