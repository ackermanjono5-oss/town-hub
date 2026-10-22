import { getCurrentUser, getSupabaseClient } from '@/lib/supabase/client';
import type { AdvertiserStatus, ApprovalStatus, Business, Offer } from '@/lib/rewards/types';
import type {
  AdminMemberRow,
  AdminRedemptionRow,
  BusinessWithOwner,
  CreateBusinessInput,
  CreateOfferInput,
} from './types';

export async function listBusinesses(): Promise<BusinessWithOwner[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*, owner:profiles!businesses_owner_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listBusinesses failed', error);
    return [];
  }
  return (data ?? []) as unknown as BusinessWithOwner[];
}

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const supabase = getSupabaseClient();
  // Created by Town Hub itself, so approved from the start; the advertiser
  // status still has to be confirmed before it can run rewards.
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: input.name,
      description: input.description,
      category: input.category,
      approval_status: 'approved',
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create business.');
  return data;
}

async function currentAdminId(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}

/** Accept, deny, suspend or reinstate a business's rewards access. */
export async function setBusinessApproval(
  businessId: string,
  status: ApprovalStatus,
  note?: string | null
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('businesses')
    .update({
      approval_status: status,
      approval_note: note?.trim() || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: await currentAdminId(),
    })
    .eq('id', businessId);
  if (error) throw new Error(error.message);
}

/** Records the business's Town Hub advertising subscription standing. */
export async function setAdvertiserStatus(
  businessId: string,
  status: AdvertiserStatus,
  paidUntil: string | null
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('businesses')
    .update({ advertiser_status: status, advertising_paid_until: paidUntil || null })
    .eq('id', businessId);
  if (error) throw new Error(error.message);
}

/** Approves or rejects a submitted offer, optionally adjusting its limit. */
export async function reviewOffer(
  offerId: string,
  decision: 'approved' | 'rejected',
  options: { note?: string | null; monthlyLimit?: number } = {}
): Promise<void> {
  const supabase = getSupabaseClient();
  const update: Record<string, unknown> = {
    status: decision,
    review_note: options.note?.trim() || null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: await currentAdminId(),
  };
  if (options.monthlyLimit) update.monthly_limit = options.monthlyLimit;
  const { error } = await supabase.from('offers').update(update).eq('id', offerId);
  if (error) throw new Error(error.message);
}

export async function generateRegistrationCode(businessId: string, businessName: string): Promise<string> {
  const supabase = getSupabaseClient();
  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();

  const { error } = await supabase
    .from('business_registration_codes')
    .insert({ code, business_id: businessId, business_name_hint: businessName });

  if (error) throw new Error(error.message);
  return code;
}

export async function listOffersAdmin(businessId?: string): Promise<(Offer & { business: { name: string } })[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('offers')
    .select('*, business:businesses(name)')
    .order('created_at', { ascending: false });
  if (businessId) query = query.eq('business_id', businessId);

  const { data, error } = await query;
  if (error) {
    console.error('listOffersAdmin failed', error);
    return [];
  }
  return (data ?? []) as unknown as (Offer & { business: { name: string } })[];
}

export async function createOfferAdmin(input: CreateOfferInput): Promise<Offer> {
  const supabase = getSupabaseClient();
  // Town Hub creating an offer itself is the approval.
  const { data, error } = await supabase
    .from('offers')
    .insert({ ...input, status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: await currentAdminId() })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create offer.');
  return data;
}

export async function toggleOfferActive(offerId: string, isActive: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('offers').update({ is_active: isActive }).eq('id', offerId);
  if (error) throw new Error(error.message);
}

export async function updateOfferAdmin(
  offerId: string,
  updates: Partial<Pick<Offer, 'title' | 'description' | 'discount_value' | 'monthly_limit'>>
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('offers').update(updates).eq('id', offerId);
  if (error) throw new Error(error.message);
}

export async function listRedemptionsAdmin(filters: {
  businessId?: string;
  period?: string;
}): Promise<AdminRedemptionRow[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('redemptions')
    .select('id, redeemed_at, period, business:businesses(name), offer:offers(title), customer:profiles(full_name)')
    .order('redeemed_at', { ascending: false });

  if (filters.businessId) query = query.eq('business_id', filters.businessId);
  if (filters.period) query = query.eq('period', filters.period);

  const { data, error } = await query;
  if (error) {
    console.error('listRedemptionsAdmin failed', error);
    return [];
  }
  return (data ?? []) as unknown as AdminRedemptionRow[];
}

/** Members matching a name, email or phone search (all if blank). Admin only. */
export async function listMembers(search?: string): Promise<AdminMemberRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('admin_list_members', {
    p_search: search?.trim() || null,
    p_limit: 200,
  });
  if (error) {
    console.error('listMembers failed', error);
    throw new Error(error.message);
  }
  return (data ?? []) as AdminMemberRow[];
}

/** Switches a member's rewards membership on or off. Admin only. */
export async function setMembership(userId: string, subscribed: boolean): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('admin_set_membership', { p_user: userId, p_subscribed: subscribed });
  if (error) throw new Error(error.message);
}
