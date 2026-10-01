import { getCurrentUser, getSupabaseClient } from '@/lib/supabase/client';
import {
  RedeemOfferError,
  type Offer,
  type OfferWithBusiness,
  type Profile,
  type RedeemErrorCode,
  type RedeemOfferResponse,
} from './types';

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_subscribed, avatar, avatar_url, home_town, phone, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('getMyProfile failed', error);
    return null;
  }
  return data;
}

export async function listActiveOffers(): Promise<OfferWithBusiness[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, business:businesses(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listActiveOffers failed', error);
    return [];
  }
  return (data ?? []) as OfferWithBusiness[];
}

export async function getOfferById(offerId: string): Promise<OfferWithBusiness | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*, business:businesses(*)')
    .eq('id', offerId)
    .maybeSingle();

  if (error) {
    console.error('getOfferById failed', error);
    return null;
  }
  return data as OfferWithBusiness | null;
}

// Placeholder kept for callers that only need the base Offer shape (e.g.
// future admin tooling) without pulling in the joined business row.
export type { Offer };

export async function redeemOffer(offerId: string): Promise<RedeemOfferResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<RedeemOfferResponse>('redeem-offer', {
    body: { offerId },
  });

  if (error) {
    let code: RedeemErrorCode = 'SERVER_ERROR';
    let message = 'Something went wrong. Please try again.';
    const context = (error as { context?: Response }).context;
    if (context) {
      try {
        const body = await context.json();
        if (body?.code) code = body.code;
        if (body?.error) message = body.error;
      } catch {
        // Response body wasn't JSON — fall back to the generic message.
      }
    }
    throw new RedeemOfferError(code, message);
  }

  if (!data) {
    throw new RedeemOfferError('SERVER_ERROR', 'Something went wrong. Please try again.');
  }
  return data;
}

/**
 * Writes the editable part of the signed-in user's profile.
 *
 * Only the four columns granted in migration 0008 are writable; role and
 * is_subscribed are rejected by Postgres rather than trusted to stay out of
 * the payload here. Returns an error message, or null on success.
 */
export type ProfilePatch = Partial<
  Pick<Profile, 'full_name' | 'avatar' | 'avatar_url' | 'home_town' | 'phone'>
>;

export async function updateMyProfile(patch: ProfilePatch): Promise<string | null> {
  const supabase = getSupabaseClient();
  // getCurrentUser reads the stored session; getUser() revalidates against
  // the Auth server and never settles offline, which would leave the Save
  // button spinning forever in the WebView.
  const user = await getCurrentUser();
  if (!user) return 'You are not signed in.';

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
  if (error) {
    console.error('updateMyProfile failed', error);
    return error.message;
  }
  return null;
}

/** Convenience wrapper kept for the name-only edit path. */
export async function updateMyName(fullName: string): Promise<string | null> {
  return updateMyProfile({ full_name: fullName.trim() || null });
}
