import { Gift, Sparkles } from 'lucide-react';

// Informational for now — there's no purchase/billing flow yet, so this
// doesn't link anywhere; Town Hub switches memberships on from Admin →
// Members. Becomes a real upgrade call to action once subscriptions are
// wired to payment.
export default function MembershipNotice() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7a2e0e] via-[#e0662b] to-[#f6b44b] p-6 text-white shadow-[0_18px_36px_-20px_rgba(224,102,43,0.9)]">
      <div className="absolute inset-0 hero-dots opacity-40" aria-hidden="true" />
      <Gift className="absolute -right-4 -bottom-4 w-28 h-28 text-white/15" strokeWidth={1.25} aria-hidden="true" />
      <span className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wide">
        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        Members only
      </span>
      <p className="relative mt-3 text-xl font-extrabold">Unlock local rewards</p>
      <p className="relative mt-1.5 max-w-md text-sm text-white/90">
        Become a Town Hub member to get monthly deals from participating Garden Route businesses.
        Contact Town Hub at info@seaexpress.co.za to join.
      </p>
    </div>
  );
}
