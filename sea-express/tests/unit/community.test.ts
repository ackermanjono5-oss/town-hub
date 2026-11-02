import { describe, expect, it } from 'vitest';
import { getWallCategoryLabel, timeAgo, validateWallPost, WALL_BODY_MAX } from '@/lib/community/types';

const draft = { category: 'lost_found' as const, town: 'george', body: 'Brown dog seen near the beach', contact: null };

describe('validateWallPost', () => {
  it('accepts a normal post', () => {
    expect(validateWallPost(draft)).toBeNull();
  });

  it('rejects posts that are too short once trimmed', () => {
    expect(validateWallPost({ ...draft, body: '   short   ' })).toMatch(/at least 10/);
  });

  it('rejects posts over the limit', () => {
    expect(validateWallPost({ ...draft, body: 'x'.repeat(WALL_BODY_MAX + 1) })).toMatch(/under 1000/);
  });

  it('rejects over-long contact details and unknown categories', () => {
    expect(validateWallPost({ ...draft, contact: '0'.repeat(121) })).toMatch(/contact/);
    // @ts-expect-error -- testing a value the type doesn't allow
    expect(validateWallPost({ ...draft, category: 'spam' })).toMatch(/category/);
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-11-02T12:00:00Z');
  it('describes recent times', () => {
    expect(timeAgo('2026-11-02T11:59:30Z', now)).toBe('just now');
    expect(timeAgo('2026-11-02T11:55:00Z', now)).toBe('5 min ago');
    expect(timeAgo('2026-11-02T09:00:00Z', now)).toBe('3 h ago');
    expect(timeAgo('2026-11-01T11:00:00Z', now)).toBe('1 day ago');
    expect(timeAgo('2026-10-30T12:00:00Z', now)).toBe('3 days ago');
  });

  it('falls back to a date after a week', () => {
    expect(timeAgo('2026-10-01T12:00:00Z', now)).toMatch(/2026/);
  });
});

describe('getWallCategoryLabel', () => {
  it('labels known categories and passes unknown ones through', () => {
    expect(getWallCategoryLabel('motorist')).toBe('Stranded motorists');
    expect(getWallCategoryLabel('other')).toBe('other');
  });
});
