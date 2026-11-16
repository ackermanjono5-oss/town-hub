import { getCurrentUser, getSupabaseClient } from '@/lib/supabase/client';
import type { ListingInput, ListingStatus, PropertyListing } from './types';

/**
 * Live listings, newest first, for the public Property page. RLS only
 * returns approved listings from agencies Town Hub still lists. `unavailable`
 * means the table isn't in the database yet (migration 0014 not applied).
 */
export async function listLiveListings(): Promise<{ listings: PropertyListing[]; unavailable: boolean }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('property_listings')
    .select('*')
    .eq('status', 'approved')
    .order('is_sold', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) {
    console.error('listLiveListings failed', error);
    return { listings: [], unavailable: error.code === 'PGRST205' || error.code === '42P01' };
  }
  return { listings: (data ?? []) as PropertyListing[], unavailable: false };
}

export async function getListing(id: string): Promise<PropertyListing | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('property_listings').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('getListing failed', error);
    return null;
  }
  return data as PropertyListing | null;
}

/** All of an agency's own listings, in any state. */
export async function listAgencyListings(businessId: string): Promise<PropertyListing[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('property_listings')
    .select('*')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as PropertyListing[];
}

export async function saveListing(
  businessId: string,
  input: ListingInput,
  status: Extract<ListingStatus, 'draft' | 'submitted'>,
  id?: string
): Promise<PropertyListing> {
  const supabase = getSupabaseClient();
  const row = { ...input, status };
  const { data, error } = id
    ? await supabase.from('property_listings').update(row).eq('id', id).select().single()
    : await supabase
        .from('property_listings')
        .insert({ ...row, business_id: businessId })
        .select()
        .single();
  if (error) throw new Error(error.message);
  return data as PropertyListing;
}

export async function setListingSold(id: string, isSold: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('property_listings').update({ is_sold: isSold }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteListing(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('property_listings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------
// Admin (enforced by RLS)
// ---------------------------------------------------------------------

export async function listListingsForReview(): Promise<PropertyListing[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('property_listings')
    .select('*')
    .neq('status', 'draft')
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return (data ?? []) as PropertyListing[];
}

export async function reviewListing(id: string, decision: 'approved' | 'rejected', note: string | null): Promise<void> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  const { error } = await supabase
    .from('property_listings')
    .update({
      status: decision,
      review_note: note,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id ?? null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
