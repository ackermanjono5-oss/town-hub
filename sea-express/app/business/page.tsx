'use client';

import { ScanLine, ArrowLeft } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';

export default function BusinessDashboardPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Town Hub
      </a>

      <RequireBusiness>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Business Dashboard</h1>
            <p className="text-muted-foreground">Scan a customer&rsquo;s QR code to redeem their reward.</p>
          </div>
          <a
            href="/business/scan"
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
          >
            <ScanLine className="w-5 h-5" aria-hidden="true" />
            Scan & Redeem
          </a>
        </div>
      </RequireBusiness>
    </div>
  );
}
