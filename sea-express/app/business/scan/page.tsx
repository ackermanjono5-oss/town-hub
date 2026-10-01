'use client';

import { ArrowLeft } from 'lucide-react';
import RequireBusiness from '@/components/business/RequireBusiness';
import ScanScreen from '@/components/business/ScanScreen';

export default function BusinessScanPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <a
        href="/business"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Dashboard
      </a>

      <RequireBusiness>
        <ScanScreen />
      </RequireBusiness>
    </div>
  );
}
