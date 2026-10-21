'use client';

import { ArrowLeft, ScanLine, Gift, History, BadgeCheck, type LucideIcon } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';

export default function BusinessRewardsPortalPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Town Hub
      </a>

      <RequireBusiness>
        {({ business, role }) => (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business Rewards Portal
              </p>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {business.trading_name || business.name}
                <BadgeCheck className="w-5 h-5 text-primary" aria-label="Approved Town Hub business" />
              </h1>
              <p className="text-sm text-muted-foreground">
                {role === 'owner' ? 'Owner' : 'Staff'} account
                {business.advertising_paid_until
                  ? ` · Advertising active until ${business.advertising_paid_until}`
                  : ''}
              </p>
            </div>

            <div className="grid gap-3">
              <Tile
                href="/business/scan"
                icon={ScanLine}
                title="Verify a voucher"
                text="Enter or scan the code on the customer's phone, check it and confirm the redemption."
                primary
              />
              {role === 'owner' && (
                <Tile
                  href="/business/offers"
                  icon={Gift}
                  title="My reward offers"
                  text="Create monthly rewards and submit them to Town Hub for approval."
                />
              )}
              <Tile
                href="/business/history"
                icon={History}
                title="Redemption history"
                text="Every voucher redeemed at your business, by month."
              />
            </div>
          </div>
        )}
      </RequireBusiness>
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  title,
  text,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-start gap-4 p-5 rounded-2xl border transition active:scale-[0.99] ${
        primary
          ? 'bg-primary text-primary-foreground border-primary shadow-md hover:brightness-110'
          : 'bg-background border-border hover:border-primary'
      }`}
    >
      <Icon className="w-6 h-6 shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className={`block text-sm ${primary ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
          {text}
        </span>
      </span>
    </a>
  );
}
