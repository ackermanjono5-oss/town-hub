// Single source of truth for "what calendar month is it" on the Edge
// Function side. Reward months run on South African time
// (Africa/Johannesburg), matching public.current_reward_period() in
// migration 0011 — computing it in UTC counted 00:00–02:00 SAST on the 1st
// as the previous month.
export function currentPeriod(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  return `${year}-${month}-01`;
}
