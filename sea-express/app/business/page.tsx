'use client';

import { ArrowLeft, ScanLine, Gift, History, BadgeCheck, ArrowRight, type LucideIcon } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';
import PageHero from '@/components/PageHero';
import HelpEmail from '@/components/HelpEmail';
import { BUSINESS_REGISTRATIONS_EMAIL } from '@/lib/contact';

export default function BusinessRewardsPortalPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Town Hub
      </a>

      <RequireBusiness>
        {({ business, role }) => (
          <div className="space-y-5">
            <PageHero
              eyebrow="Business Rewards Portal"
              title={
                <span className="inline-flex items-center gap-2">
                  {business.trading_name || business.name}
                  <BadgeCheck className="w-7 h-7 text-[#ffd27a]" aria-label="Approved Town Hub business" />
                </span>
              }
              subtitle={`${role === 'owner' ? 'Owner' : 'Staff'} account${
                business.advertising_paid_until ? ` · Advertising active until ${business.advertising_paid_until}` : ''
              }`}
              icon={BadgeCheck}
              theme="forest"
            />

            <div className="grid gap-3">
              <Tile
                href="/business/scan"
                icon={ScanLine}
                title="Verify a voucher"
                text="Type or scan the code on the customer's phone, check it and confirm the redemption."
                gradient="from-[#e0662b] to-[#f6b44b]"
                index={0}
                primary
              />
              {role === 'owner' && (
                <Tile
                  href="/business/offers"
                  icon={Gift}
                  title="My reward offers"
                  text="Create monthly rewards and submit them to Town Hub for approval."
                  gradient="from-[#6d5ce8] to-[#a78bfa]"
                  index={1}
                />
              )}
              <Tile
                href="/business/history"
                icon={History}
                title="Redemption history"
                text="Every voucher redeemed at your business, by month."
                gradient="from-[#1c8ec4] to-[#4cc3dd]"
                index={2}
              />
            </div>
          </div>
        )}
      </RequireBusiness>

      <HelpEmail
        prompt="Questions about registering your business? Email us at"
        email={BUSINESS_REGISTRATIONS_EMAIL}
        className="mt-6"
      />
    </div>
  );
}

function Tile({
  href,
  icon: Icon,
  title,
  text,
  gradient,
  index,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
  gradient: string;
  index: number;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      style={{ ['--i' as string]: index }}
      className={`rise-in group flex items-center gap-4 p-5 rounded-2xl transition-transform active:scale-[0.98] hover:-translate-y-0.5 ${
        primary
          ? `bg-gradient-to-r ${gradient} text-white shadow-[0_16px_30px_-16px_rgba(224,102,43,0.9)]`
          : 'bg-card/90 backdrop-blur ring-1 ring-white/70 dark:ring-white/10 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.5)]'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-12 h-12 flex-none rounded-2xl ${
          primary ? 'bg-white/25 ring-1 ring-white/30' : `bg-gradient-to-br ${gradient} text-white shadow-md`
        }`}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className={`block font-bold ${primary ? '' : 'text-slate-900'}`}>{title}</span>
        <span className={`block text-sm ${primary ? 'text-white/85' : 'text-slate-600'}`}>{text}</span>
      </span>
      <ArrowRight
        className={`w-5 h-5 flex-none transition-transform group-hover:translate-x-1 ${primary ? 'text-white/85' : 'text-slate-400'}`}
        aria-hidden="true"
      />
    </a>
  );
}
