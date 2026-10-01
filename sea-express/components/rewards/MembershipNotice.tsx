import { Gift } from 'lucide-react';

// Informational only for Phase 1 — there's no purchase/billing flow yet,
// so this doesn't link anywhere. Becomes a real upgrade CTA once
// subscriptions are wired to payment.
export default function MembershipNotice() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-md border border-border bg-secondary text-secondary-foreground">
      <Gift className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="text-sm">
        Become a Town Hub member to unlock local rewards from participating businesses.
      </p>
    </div>
  );
}
