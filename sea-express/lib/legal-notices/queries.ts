import { getSupabaseClient } from '@/lib/supabase/client';
import type { CreateLegalNoticeInput, LegalNotice } from './types';

/** Active notices for the public page, newest first. RLS hides inactive ones. */
export async function listLegalNotices(): Promise<LegalNotice[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('legal_notices')
    .select('*')
    .eq('is_active', true)
    .order('published_on', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listLegalNotices failed', error);
    return [];
  }
  return (data ?? []) as LegalNotice[];
}

/** Every notice, active or not — admin only (enforced by RLS). */
export async function listLegalNoticesAdmin(): Promise<LegalNotice[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('legal_notices')
    .select('*')
    .order('published_on', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listLegalNoticesAdmin failed', error);
    return [];
  }
  return (data ?? []) as LegalNotice[];
}

export async function createLegalNotice(input: CreateLegalNoticeInput): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('legal_notices').insert(input);
  if (error) throw new Error(error.message);
}

export async function setLegalNoticeActive(id: string, isActive: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('legal_notices')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
