import { getSupabaseClient } from '@/lib/supabase/client';
import type { Business, Offer } from '@/lib/rewards/types';
import type {
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
  const { data, error } = await supabase
    .from('businesses')
    .insert({ name: input.name, description: input.description, category: input.category })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create business.');
  return data;
}

export async function approveBusiness(businessId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('businesses').update({ is_active: true }).eq('id', businessId);
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
  const { data, error } = await supabase.from('offers').insert(input).select('*').single();

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
  updates: Partial<Pick<Offer, 'title' | 'description' | 'discount_value'>>
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
