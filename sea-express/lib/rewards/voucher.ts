/** Shows a voucher code as two groups of four, e.g. K7PM3QXH → K7PM-3QXH. */
export function formatVoucherCode(code: string | null | undefined): string {
  if (!code) return '';
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

/**
 * Whether typed input looks like a voucher code rather than a scanned QR
 * token: 8 letters/digits from the code alphabet, dash and spaces ignored.
 */
export function looksLikeVoucherCode(input: string): boolean {
  return /^[A-HJ-NP-Z2-9]{8}$/.test(input.toUpperCase().replace(/[\s-]/g, ''));
}

/** "October 2026" for a period date like 2026-10-01. */
export function formatPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
