import { getSupabaseClient } from '@/lib/supabase/client';
import type { Business } from '@/lib/rewards/types';
import {
  ApproveRedemptionError,
  type ApproveErrorCode,
  type ApproveRedemptionResponse,
  type RegisterBusinessInput,
} from './types';

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

export async function registerBusiness(input: RegisterBusinessInput): Promise<Business> {
  const supabase = getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in to register your business.');

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name: input.name,
      description: input.description,
      category: input.category,
      is_active: false,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to register business.');
  return data;
}

export async function approveRedemption(qrToken: string, dryRun: boolean): Promise<ApproveRedemptionResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke<ApproveRedemptionResponse>('approve-redemption', {
    body: { qrToken, dryRun },
  });

  if (error) {
    let code: ApproveErrorCode = 'SERVER_ERROR';
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
    throw new ApproveRedemptionError(code, message);
  }

  if (!data) {
    throw new ApproveRedemptionError('SERVER_ERROR', 'Something went wrong. Please try again.');
  }
  return data;
}
