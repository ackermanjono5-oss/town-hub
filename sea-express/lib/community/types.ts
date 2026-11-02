export type WallCategory = 'lost_found' | 'motorist' | 'safety' | 'notice';

export const WALL_CATEGORIES: { value: WallCategory; label: string }[] = [
  { value: 'lost_found', label: 'Lost & found pets' },
  { value: 'motorist', label: 'Stranded motorists' },
  { value: 'safety', label: 'Safety alerts' },
  { value: 'notice', label: 'Community notices' },
];

export function getWallCategoryLabel(value: string): string {
  return WALL_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export interface WallPost {
  id: string;
  author_id: string;
  author_name: string;
  category: WallCategory;
  town: string | null;
  body: string;
  contact: string | null;
  report_count: number;
  is_hidden: boolean;
  created_at: string;
}

export interface CreateWallPostInput {
  category: WallCategory;
  town: string | null;
  body: string;
  contact: string | null;
}

export const WALL_BODY_MIN = 10;
export const WALL_BODY_MAX = 1000;

/** What's wrong with a draft post, or null when it can be sent. Mirrors the table's checks. */
export function validateWallPost(input: CreateWallPostInput): string | null {
  const body = input.body.trim();
  if (body.length < WALL_BODY_MIN) return `Please write at least ${WALL_BODY_MIN} characters.`;
  if (body.length > WALL_BODY_MAX) return `Please keep it under ${WALL_BODY_MAX} characters.`;
  if (input.contact && input.contact.trim().length > 120) return 'The contact details are too long.';
  if (!WALL_CATEGORIES.some((c) => c.value === input.category)) return 'Please choose a category.';
  return null;
}

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a date. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}
