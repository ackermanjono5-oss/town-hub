import { afterEach, describe, expect, it, vi } from 'vitest';
import { offerDisplayState } from '@/lib/rewards/offer-status';
import type { Offer } from '@/lib/rewards/types';
import { appHref } from '@/lib/app-nav';
import { findDoodle, pickDoodle } from '@/lib/doodles';

const base = { status: 'approved', is_active: true, starts_at: null, ends_at: null } as unknown as Offer;
const now = new Date('2026-11-02T10:00:00Z');

describe('offerDisplayState', () => {
  it('follows the workflow status first', () => {
    expect(offerDisplayState({ ...base, status: 'draft' } as Offer, now)).toBe('Draft');
    expect(offerDisplayState({ ...base, status: 'submitted' } as Offer, now)).toBe('Submitted');
    expect(offerDisplayState({ ...base, status: 'rejected' } as Offer, now)).toBe('Rejected');
    expect(offerDisplayState({ ...base, is_active: false }, now)).toBe('Deactivated');
  });

  it('uses the dates for approved offers', () => {
    expect(offerDisplayState({ ...base, starts_at: '2026-12-01T00:00:00Z' }, now)).toBe('Scheduled');
    expect(offerDisplayState({ ...base, ends_at: '2026-10-31T00:00:00Z' }, now)).toBe('Expired');
    expect(offerDisplayState(base, now)).toBe('Live');
  });
});

describe('appHref (links inside the Android app)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('leaves links alone on the web', () => {
    vi.stubGlobal('window', {});
    expect(appHref('/login')).toBe('/login');
  });

  it('rewrites root-relative links to bundled files', () => {
    vi.stubGlobal('window', { __TH_BASE__: '../' });
    expect(appHref('/')).toBe('../index.html');
    expect(appHref('/login')).toBe('../login.html');
    expect(appHref('/rewards/offer?id=1')).toBe('../rewards/offer.html?id=1');
    expect(appHref('/icon.png')).toBe('../icon.png');
    expect(appHref('https://example.com/x')).toBe('https://example.com/x');
    expect(appHref('//cdn.example.com/x')).toBe('//cdn.example.com/x');
  });
});

describe('daily doodle', () => {
  it('switches to night after 19:00 South African time', () => {
    expect(pickDoodle(new Date('2026-11-02T18:30:00Z')).night).toBe(true);
    expect(pickDoodle(new Date('2026-11-02T10:00:00Z')).night).toBe(false);
  });

  it('shows the same doodle all day', () => {
    const morning = pickDoodle(new Date('2026-11-02T06:00:00Z'));
    const afternoon = pickDoodle(new Date('2026-11-02T14:00:00Z'));
    expect(afternoon.id).toBe(morning.id);
  });

  it('finds doodles by id for previews', () => {
    const today = pickDoodle(now);
    expect(findDoodle(today.id)?.id).toBe(today.id);
    expect(findDoodle('definitely-not-a-doodle')).toBeUndefined();
  });
});
