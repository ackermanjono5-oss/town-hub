'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Gift, Receipt, ArrowLeft } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/businesses', label: 'Businesses', icon: Store },
  { href: '/admin/offers', label: 'Offers', icon: Gift },
  { href: '/admin/redemptions', label: 'Redemptions', icon: Receipt },
];

export default function AdminHeader() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-border pb-3">
      <nav className="flex flex-wrap items-center gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition ${
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {label}
            </a>
          );
        })}
        <a
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:bg-secondary transition ml-auto"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Town Hub
        </a>
      </nav>
    </div>
  );
}
