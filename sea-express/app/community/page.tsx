'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PawPrint,
  Car,
  ShieldAlert,
  Megaphone,
  BookOpen,
  Flag,
  Trash2,
  MapPin,
  Phone,
  PenLine,
  LogIn,
  type LucideIcon,
} from 'lucide-react';
import PageHero from '@/components/PageHero';
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice';
import { Users as HeroIcon } from 'lucide-react';
import { getCurrentUser, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import { createWallPost, deleteWallPost, listWallPosts, reportWallPost } from '@/lib/community/queries';
import {
  WALL_BODY_MAX,
  WALL_CATEGORIES,
  getWallCategoryLabel,
  timeAgo,
  validateWallPost,
  type WallCategory,
  type WallPost,
} from '@/lib/community/types';

// What the wall is for, from the official Community Wall guidelines.
const TOPICS: Record<WallCategory, { icon: LucideIcon; text: string; chip: string }> = {
  lost_found: {
    icon: PawPrint,
    text: 'Missing dogs, cats and rescued animals, with where they were last seen.',
    chip: 'bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300',
  },
  motorist: {
    icon: Car,
    text: 'Broken-down vehicles and roadside help, without putting anyone at risk.',
    chip: 'bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300',
  },
  safety: {
    icon: ShieldAlert,
    text: 'Responsible reports of theft, unrest, road closures and storm damage.',
    chip: 'bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300',
  },
  notice: {
    icon: Megaphone,
    text: 'Missing property, local disruptions and useful information for residents.',
    chip: 'bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300',
  },
};

const CARD =
  'rounded-2xl bg-card/85 backdrop-blur border border-white/60 dark:border-white/10 shadow-lg';
const INPUT =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-card text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary';

type Filter = WallCategory | 'all';

export default function CommunityPage() {
  const [posts, setPosts] = useState<WallPost[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [composing, setComposing] = useState(false);

  async function refresh() {
    const result = await listWallPosts();
    setPosts(result.posts);
    setUnavailable(result.unavailable);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    refresh();
    getCurrentUser().then((user) => setUserId(user?.id ?? null));
    const { data: sub } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const visible = useMemo(
    () => (posts ?? []).filter((p) => filter === 'all' || p.category === filter),
    [posts, filter]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Community Wall"
        subtitle="Lost & found, stranded motorists, safety alerts and local notices"
        icon={HeroIcon}
        theme="coral"
        className="mb-6"
      />

      {!isSupabaseConfigured ? (
        <SupabaseSetupNotice feature="the Community Wall" />
      ) : unavailable ? (
        <AboutWall note="The Community Wall is being set up and opens soon." />
      ) : (
        <>
          <section className={`${CARD} p-4 sm:p-5`}>
            {composing && userId ? (
              <Composer
                onCancel={() => setComposing(false)}
                onPosted={async () => {
                  setComposing(false);
                  await refresh();
                }}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Seen a lost pet, a stranded driver or something neighbours should know?
                </p>
                {userId ? (
                  <button
                    type="button"
                    onClick={() => setComposing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4416a] to-[#ff8f7a] text-white text-sm font-semibold shadow-md active:scale-95 transition"
                  >
                    <PenLine className="w-4 h-4" aria-hidden="true" />
                    Write a post
                  </button>
                ) : (
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    Sign in to post
                  </a>
                )}
              </div>
            )}
          </section>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
            {([{ value: 'all', label: 'All posts' }, ...WALL_CATEGORIES] as { value: Filter; label: string }[]).map(
              (c) => {
                const selected = c.value === filter;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFilter(c.value)}
                    aria-pressed={selected}
                    className={[
                      'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition active:scale-95',
                      selected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-card text-slate-600 border-slate-200 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {c.label}
                  </button>
                );
              }
            )}
          </div>

          <div className="mt-4 space-y-3">
            {posts === null ? (
              <p className="text-sm text-slate-500 text-center py-12">Loading posts…</p>
            ) : visible.length === 0 ? (
              <AboutWall
                note={
                  filter === 'all'
                    ? 'Nothing on the wall yet. Be the first to post.'
                    : `No ${getWallCategoryLabel(filter).toLowerCase()} right now.`
                }
              />
            ) : (
              visible.map((post) => (
                <PostCard key={post.id} post={post} userId={userId} onChanged={refresh} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Composer({ onCancel, onPosted }: { onCancel: () => void; onPosted: () => void }) {
  const [category, setCategory] = useState<WallCategory>('lost_found');
  const [town, setTown] = useState('');
  const [body, setBody] = useState('');
  const [contact, setContact] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = { category, town: town || null, body, contact: contact.trim() || null };
    const problem = validateWallPost(input);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createWallPost(input);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="font-bold text-slate-900">New post</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as WallCategory)} className={INPUT}>
            {WALL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Town</span>
          <select value={town} onChange={(e) => setTown(e.target.value)} className={INPUT}>
            <option value="">Whole Garden Route</option>
            {TOWNS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">What happened?</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={WALL_BODY_MAX}
          required
          placeholder="Where, when and what to look out for. Don't share anyone's private details."
          className={INPUT}
        />
        <span className="mt-1 block text-right text-xs text-slate-500">
          {body.trim().length}/{WALL_BODY_MAX}
        </span>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">How to reach you (optional)</span>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={120}
          placeholder="e.g. 082 000 0000"
          className={INPUT}
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#d4416a]"
          required
        />
        <span>
          I&apos;ve read the{' '}
          <a href="/guidelines" className="text-primary underline">
            Community Wall guidelines
          </a>{' '}
          and this post follows them.
        </span>
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !agreed}
          className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4416a] to-[#ff8f7a] text-white text-sm font-semibold shadow-md disabled:opacity-60 active:scale-95 transition"
        >
          {busy ? 'Posting…' : 'Post to the wall'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PostCard({ post, userId, onChanged }: { post: WallPost; userId: string | null; onChanged: () => void }) {
  const topic = TOPICS[post.category] ?? TOPICS.notice;
  const Icon = topic.icon;
  const mine = userId !== null && post.author_id === userId;
  const [reported, setReported] = useState(false);
  const [busy, setBusy] = useState(false);

  async function report() {
    const reason = window.prompt('Why should this post be removed? (optional)');
    if (reason === null) return;
    setBusy(true);
    try {
      await reportWallPost(post.id, reason.trim() || null);
      setReported(true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not report the post.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this post?')) return;
    setBusy(true);
    try {
      await deleteWallPost(post.id);
      onChanged();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not delete the post.');
      setBusy(false);
    }
  }

  return (
    <article className={`${CARD} p-4`}>
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center justify-center w-10 h-10 flex-none rounded-xl ${topic.chip}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {getWallCategoryLabel(post.category)}
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{post.author_name}</span> · {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {post.is_hidden && (
        <p className="mt-3 rounded-lg bg-amber-100 dark:bg-amber-400/15 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          Hidden after reports from members. Only you and Town Hub can see it until it&apos;s reviewed.
        </p>
      )}

      <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-slate-800">{post.body}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {post.town ? getTownLabel(post.town) : 'Garden Route'}
        </span>
        {post.contact && (
          <span className="inline-flex items-center gap-1 break-all">
            <Phone className="w-4 h-4 flex-none" aria-hidden="true" />
            {post.contact}
          </span>
        )}
      </div>

      {userId && (
        <div className="mt-3 flex justify-end gap-2 border-t border-slate-200/70 pt-3">
          {mine ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Delete
            </button>
          ) : reported ? (
            <span className="px-3 py-1.5 text-xs text-slate-500">Reported. Thank you.</span>
          ) : (
            <button
              type="button"
              onClick={report}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-60 transition"
            >
              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
              Report
            </button>
          )}
        </div>
      )}
    </article>
  );
}

/** What the wall is for, shown while it's empty or not yet open. */
function AboutWall({ note }: { note: string }) {
  return (
    <section className={`${CARD} p-5`}>
      <p className="font-medium text-slate-700">{note}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {WALL_CATEGORIES.map(({ value, label }, i) => {
          const { icon: Icon, text, chip } = TOPICS[value];
          return (
            <div
              key={value}
              style={{ ['--i' as string]: i }}
              className="rise-in flex gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-slate-100"
            >
              <span className={`inline-flex items-center justify-center w-10 h-10 flex-none rounded-xl ${chip}`}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900">{label}</span>
                <span className="block text-sm text-slate-600">{text}</span>
              </span>
            </div>
          );
        })}
      </div>
      <a
        href="/guidelines"
        className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0f172a] dark:bg-[#1e3a5f] text-white text-sm font-semibold shadow-lg hover:bg-[#1e293b] dark:hover:bg-[#244870] active:scale-95 transition"
      >
        <BookOpen className="w-4 h-4" aria-hidden="true" />
        Read the Community Wall guidelines
      </a>
    </section>
  );
}
