// Single source of truth for "what calendar month is it" — shared by
// redeem-offer and approve-redemption so they can never disagree about
// the current period.
export function currentPeriod(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
}
