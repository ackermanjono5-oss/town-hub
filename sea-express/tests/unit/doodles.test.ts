import { describe, expect, it } from 'vitest';
import { findDoodle, happeningOn, pickDoodle } from '@/lib/doodles';

/** Noon in South Africa on a given date. */
const sa = (iso: string) => new Date(`${iso}T10:00:00Z`);

describe('happenings calendar', () => {
  it('covers ranges that run over New Year', () => {
    expect(happeningOn('12-20')?.id).toBe('summer-holidays');
    expect(happeningOn('01-05')?.id).toBe('summer-holidays');
  });

  it('lets a one-day happening win over a month-long one', () => {
    expect(happeningOn('09-01', 0)?.id).toBe('spring-day');
    expect(happeningOn('09-01', 7)?.id).toBe('spring-day');
    expect(happeningOn('12-01', 3)?.id).toBe('aids-day');
  });

  it('takes turns when several longer happenings overlap', () => {
    const july = new Set([0, 1, 2, 3].map((r) => happeningOn('07-05', r)?.id));
    expect(july).toEqual(new Set(['sardine-run', 'oyster-festival', 'mandela-month']));
  });

  it('returns nothing on days without a happening', () => {
    expect(happeningOn('05-10')).toBeNull();
  });

  it('has something meaningful on most days of the year', () => {
    let covered = 0;
    for (let d = 0; d < 365; d++) {
      const date = new Date(Date.UTC(2026, 0, 1 + d));
      const mmdd = `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
      if (happeningOn(mmdd)) covered += 1;
    }
    expect(covered).toBeGreaterThan(250);
  });
});

describe('pickDoodle', () => {
  it('still puts public holidays first', () => {
    expect(pickDoodle(sa('2026-09-24')).id).toBe('heritage');
    expect(pickDoodle(sa('2026-12-25')).id).toBe('christmas');
  });

  it('shows a happening, with its summary, on an ordinary day', () => {
    const d = pickDoodle(sa('2026-02-02'));
    expect(d.id).toBe('wetlands-day');
    expect(d.fact).toMatch(/Wilderness/);
    expect(d.when).toBe('2 February');
  });

  it('keeps every caption short enough for the header and every summary filled in', () => {
    for (let d = 0; d < 365; d++) {
      const doodle = pickDoodle(new Date(Date.UTC(2026, 0, 1 + d, 10)));
      expect(doodle.caption.length, doodle.id).toBeLessThanOrEqual(40);
      expect(doodle.fact.length, doodle.id).toBeGreaterThan(40);
    }
  });

  it('can preview any happening by id', () => {
    expect(findDoodle('oyster-festival')?.caption).toMatch(/Knysna/);
  });
});
