'use client';

import { useEffect, useState } from 'react';
import { getTownLabel } from '@/lib/garden-route/towns';
import {
  deleteWallPost,
  listWallPosts,
  listWallReports,
  setWallPostHidden,
} from '@/lib/community/queries';
import { getWallCategoryLabel, timeAgo, type WallPost } from '@/lib/community/types';

type View = 'reported' | 'all';

export default function AdminWallPage() {
  const [posts, setPosts] = useState<WallPost[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [view, setView] = useState<View>('reported');
  const [reasons, setReasons] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const result = await listWallPosts();
    setPosts(result.posts);
    setUnavailable(result.unavailable);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function act(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function showReasons(post: WallPost) {
    try {
      const rows = await listWallReports(post.id);
      setReasons((r) => ({ ...r, [post.id]: rows.map((x) => x.reason || '(no reason given)') }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reports.');
    }
  }

  const shown = (posts ?? []).filter((p) => view === 'all' || p.report_count > 0 || p.is_hidden);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Community Wall</h1>
        <p className="text-muted-foreground">
          Posts go live straight away. A post with 3 reports is hidden until you restore or delete it.
        </p>
      </div>

      {unavailable ? (
        <p className="p-4 rounded-lg border border-border bg-background text-sm">
          The wall&apos;s tables aren&apos;t in the database yet. Run{' '}
          <code className="font-mono">supabase/migrations/0013_community_wall.sql</code> in the Supabase SQL Editor.
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            {(['reported', 'all'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {v === 'reported' ? 'Reported or hidden' : 'All posts'}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {posts === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {view === 'reported' ? 'Nothing reported. All clear.' : 'No posts yet.'}
            </p>
          ) : (
            <ul className="space-y-3">
              {shown.map((post) => (
                <li key={post.id} className="p-4 rounded-lg border border-border bg-background space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold">{getWallCategoryLabel(post.category)}</span>
                    <span className="text-muted-foreground">
                      {post.town ? getTownLabel(post.town) : 'Garden Route'} · {post.author_name} ·{' '}
                      {timeAgo(post.created_at)}
                    </span>
                    {post.report_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-400/15 text-rose-700 dark:text-rose-300">
                        {post.report_count} report{post.report_count === 1 ? '' : 's'}
                      </span>
                    )}
                    {post.is_hidden && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-400/15 text-amber-800 dark:text-amber-300">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-line break-words">{post.body}</p>
                  {post.contact && <p className="text-xs text-muted-foreground">Contact: {post.contact}</p>}
                  {reasons[post.id] && (
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">
                      {reasons[post.id].map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => act(() => setWallPostHidden(post.id, !post.is_hidden))}
                      className="px-3 py-1.5 rounded-md border border-border text-sm hover:bg-secondary"
                    >
                      {post.is_hidden ? 'Restore' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this post permanently?')) act(() => deleteWallPost(post.id));
                      }}
                      className="px-3 py-1.5 rounded-md border border-border text-sm text-danger hover:bg-secondary"
                    >
                      Delete
                    </button>
                    {post.report_count > 0 && !reasons[post.id] && (
                      <button
                        type="button"
                        onClick={() => showReasons(post)}
                        className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-secondary"
                      >
                        Show report reasons
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
