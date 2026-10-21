import { getCurrentUser, getSupabaseClient } from '@/lib/supabase/client';
import type { Business, Offer, OfferStatus } from '@/lib/rewards/types';
import { looksLikeVoucherCode } from '@/lib/rewards/voucher';
import {
  ApproveRedemptionError,
  type ApproveErrorCode,
  type ApproveRedemptionResponse,
  type BusinessRedemptionRow,
  type OfferDraftInput,
  type RegisterBusinessInput,
} from './types';

export interface BusinessMembership {
  business: Business;
  /** Owners manage offers; staff only verify and redeem vouchers. */
  role: 'owner' | 'staff';
}

export async function getMyBusiness(userId: string): Promise<Business | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    console.error('getMyBusiness failed', error);
    return null;
  }
  return data;
}

/** The business this user owns, or else the one they're active staff at. */
export async function getMyBusinessMembership(userId: string): Promise<BusinessMembership | null> {
  const owned = await getMyBusiness(userId);
  if (owned) return { business: owned, role: 'owner' };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .select('business:businesses(*)')
    .eq('profile_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) {
    console.error('getMyBusinessMembership failed', error);
    return null;
  }
  const business = (data?.business ?? null) as Business | null;
  return business ? { business, role: 'staff' } : null;
}

/**
 * Whether the business may run rewards right now. Mirrors
 * public.business_is_eligible() — the server re-checks on every voucher, so
 * this only decides what the portal shows.
 */
export function isBusinessEligible(business: Business): boolean {
  if (!business.is_active || business.approval_status !== 'approved') return false;
  if (business.advertiser_status !== 'active') return false;
  if (!business.advertising_paid_until) return true;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
  return business.advertising_paid_until >= today;
}

const REGISTRATION_ERRORS: [RegExp, string][] = [
  [/ALREADY_REGISTERED/, 'This account has already registered a business.'],
  [/INCOMPLETE_REGISTRATION/, 'Please complete every required field and accept the terms.'],
  [/registration_number_key/, 'A business with this company registration number is already registered.'],
  [/directory_listing_key/, 'This directory listing is already linked to a registered business.'],
];

export async function registerBusiness(input: RegisterBusinessInput): Promise<Business> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in to register your business.');
  if (!input.accept_terms) throw new Error('Please accept the programme terms and conditions.');

  const trim = (v?: string) => (v && v.trim() ? v.trim() : null);
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      // The public name shown to customers is the trading name, if any.
      name: trim(input.trading_name) ?? input.registered_name.trim(),
      registered_name: input.registered_name.trim(),
      trading_name: trim(input.trading_name),
      registration_number: input.registration_number.trim(),
      directory_listing_id: trim(input.directory_listing_id),
      category: trim(input.category),
      description: trim(input.description),
      contact_name: input.contact_name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: trim(input.address),
      town: trim(input.town),
      advertising_reference: trim(input.advertising_reference),
      terms_accepted_at: new Date().toISOString(),
      is_active: false,
    })
    .select('*')
    .single();

  if (error || !data) {
    const message = error?.message ?? '';
    const known = REGISTRATION_ERRORS.find(([re]) => re.test(message));
    throw new Error(known ? known[1] : message || 'Failed to register business.');
  }
  return data;
}

/** Sends a denied application back to Town Hub after the owner fixes it. */
export async function resubmitApplication(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('resubmit_business_application');
  if (error) throw new Error(error.message);
}

export async function updateBusinessDetails(
  businessId: string,
  patch: Partial<
    Pick<
      Business,
      | 'registered_name'
      | 'trading_name'
      | 'category'
      | 'description'
      | 'contact_name'
      | 'phone'
      | 'email'
      | 'address'
      | 'town'
      | 'advertising_reference'
      | 'directory_listing_id'
    >
  >
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('businesses').update(patch).eq('id', businessId);
  if (error) throw new Error(error.message);
}

export async function listMyOffers(businessId: string): Promise<Offer[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('listMyOffers failed', error);
    return [];
  }
  return (data ?? []) as Offer[];
}

/** Saves a draft, or submits it to Town Hub for approval. */
export async function saveOffer(
  businessId: string,
  input: OfferDraftInput,
  status: Extract<OfferStatus, 'draft' | 'submitted'>,
  offerId?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const row = { ...input, status };
  const { error } = offerId
    ? await supabase.from('offers').update(row).eq('id', offerId)
    : await supabase.from('offers').insert({ ...row, business_id: businessId });
  if (error) throw new Error(error.message);
}

export async function deleteOffer(offerId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('offers').delete().eq('id', offerId);
  if (error) throw new Error(error.message);
}

export async function listMyRedemptions(businessId: string): Promise<BusinessRedemptionRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('redemptions')
    .select('id, redeemed_at, period, offer:offers(title), token:redemption_tokens(code)')
    .eq('business_id', businessId)
    .order('redeemed_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('listMyRedemptions failed', error);
    return [];
  }
  return (data ?? []) as unknown as BusinessRedemptionRow[];
}

/**
 * Checks (dryRun) or redeems a voucher. `input` is either the short code the
 * customer shows or a scanned QR token.
 */
export async function approveRedemption(input: string, dryRun: boolean): Promise<ApproveRedemptionResponse> {
  const supabase = getSupabaseClient();
  const body = looksLikeVoucherCode(input) ? { code: input, dryRun } : { qrToken: input, dryRun };
  const { data, error } = await supabase.functions.invoke<ApproveRedemptionResponse>('approve-redemption', {
    body,
  });

  if (error) {
    let code: ApproveErrorCode = 'SERVER_ERROR';
    let message = 'Could not reach Town Hub to check this voucher. Nothing was redeemed — please try again.';
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const responseBody = await context.json();
        if (responseBody?.code) code = responseBody.code;
        if (responseBody?.error) message = responseBody.error;
      } catch {
        // Response body wasn't JSON — fall back to the generic message.
      }
    }
    throw new ApproveRedemptionError(code, message);
  }

  if (!data) {
    throw new ApproveRedemptionError(
      'SERVER_ERROR',
      'Could not reach Town Hub to check this voucher. Nothing was redeemed — please try again.'
    );
  }
  return data;
}
