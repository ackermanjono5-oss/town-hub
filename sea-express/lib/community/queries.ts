import { getSupabaseClient } from '@/lib/supabase/client';
import type { CreateWallPostInput, WallPost } from './types';

/**
 * Wall posts, newest first. RLS hides reported posts from everyone except
 * their author and admins. `unavailable` means the wall's table isn't in
 * the database yet (migration 0013 not applied), so the page can say so
 * rather than show an empty wall.
 */
export async function listWallPosts(): Promise<{ posts: WallPost[]; unavailable: boolean }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('wall_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('listWallPosts failed', error);
    return { posts: [], unavailable: error.code === 'PGRST205' || error.code === '42P01' };
  }
  return { posts: (data ?? []) as WallPost[], unavailable: false };
}

export async function createWallPost(input: CreateWallPostInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('wall_posts').insert(input);
  if (error) throw new Error(error.message);
}

export async function deleteWallPost(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('wall_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Reports a post. Reporting the same post twice is treated as done. */
export async function reportWallPost(postId: string, reason: string | null): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('wall_reports').insert({ post_id: postId, reason });
  if (error && error.code !== '23505') throw new Error(error.message);
}

/** Admin only (enforced by RLS): hide or restore a post. */
export async function setWallPostHidden(id: string, isHidden: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('wall_posts').update({ is_hidden: isHidden }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Admin only: the reasons given for a post's reports. */
export async function listWallReports(postId: string): Promise<{ reason: string | null; created_at: string }[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('wall_reports')
    .select('reason, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
