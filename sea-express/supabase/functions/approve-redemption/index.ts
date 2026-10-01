import { corsHeaders } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabaseAdmin.ts';
import { verifyQrToken } from '../_shared/token.ts';
import { currentPeriod } from '../_shared/period.ts';

type ApproveErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_A_BUSINESS_ACCOUNT'
  | 'BUSINESS_INACTIVE'
  | 'SERVER_ERROR';

type ScanResult =
  | 'VALID'
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'INVALID_TOKEN'
  | 'WRONG_BUSINESS'
  | 'OFFER_INACTIVE'
  | 'NOT_SUBSCRIBED';

const RESULT_MESSAGES: Record<ScanResult, string> = {
  VALID: 'Reward valid.',
  ALREADY_USED: 'This reward has already been redeemed.',
  EXPIRED: "This code has expired — ask the customer to generate a new one.",
  INVALID_TOKEN: 'This code is not genuine.',
  WRONG_BUSINESS: 'This code is for a different business.',
  OFFER_INACTIVE: 'This offer is no longer active.',
  NOT_SUBSCRIBED: "This customer's membership is no longer active.",
};

function errorResponse(status: number, code: ApproveErrorCode, error: string) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function resultResponse(result: ScanResult, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ result, message: RESULT_MESSAGES[result], ...extra }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to scan rewards.');
  }

  const userClient = getUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to scan rewards.');
  }

  let body: { qrToken?: unknown; dryRun?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body.');
  }
  const qrToken = body.qrToken;
  if (typeof qrToken !== 'string' || qrToken.length === 0) {
    return errorResponse(400, 'INVALID_REQUEST', 'qrToken is required.');
  }
  const dryRun = body.dryRun === true;

  const admin = getAdminClient();

  try {
    // Resolve the caller's business: owner first, then an active
    // employee row. Neither found → not a business account at all.
    const { data: ownedBusiness } = await admin
      .from('businesses')
      .select('id, is_active')
      .eq('owner_id', user.id)
      .maybeSingle();

    let business = ownedBusiness;
    if (!business) {
      const { data: employeeRow } = await admin
        .from('employees')
        .select('business:businesses(id, is_active)')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      business = (employeeRow?.business as { id: string; is_active: boolean } | null) ?? null;
    }

    if (!business) {
      return errorResponse(403, 'NOT_A_BUSINESS_ACCOUNT', 'This account is not linked to a business.');
    }
    if (!business.is_active) {
      return errorResponse(403, 'BUSINESS_INACTIVE', 'This business account is suspended.');
    }

    const secret = Deno.env.get('QR_TOKEN_SECRET');
    if (!secret) {
      console.error('QR_TOKEN_SECRET is not set');
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    const payload = await verifyQrToken(qrToken, secret);
    if (!payload) {
      return resultResponse('INVALID_TOKEN');
    }

    const { data: tokenRow } = await admin
      .from('redemption_tokens')
      .select('*')
      .eq('id', payload.tid)
      .maybeSingle();

    if (!tokenRow) {
      return resultResponse('INVALID_TOKEN');
    }
    if (tokenRow.business_id !== business.id) {
      return resultResponse('WRONG_BUSINESS');
    }
    if (tokenRow.period !== currentPeriod()) {
      return resultResponse('EXPIRED');
    }
    if (tokenRow.status === 'used') {
      return resultResponse('ALREADY_USED');
    }
    if (tokenRow.status === 'expired' || new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return resultResponse('EXPIRED');
    }

    const nowIso = new Date().toISOString();
    const { data: offer } = await admin
      .from('offers')
      .select('id, title, is_active, starts_at, ends_at, business:businesses(name)')
      .eq('id', tokenRow.offer_id)
      .eq('business_id', business.id)
      .maybeSingle();

    const offerLive =
      offer?.is_active &&
      (!offer.starts_at || offer.starts_at <= nowIso) &&
      (!offer.ends_at || offer.ends_at >= nowIso);
    if (!offer || !offerLive) {
      return resultResponse('OFFER_INACTIVE');
    }

    const { data: customerProfile } = await admin
      .from('profiles')
      .select('full_name, is_subscribed')
      .eq('id', tokenRow.customer_id)
      .maybeSingle();

    if (!customerProfile?.is_subscribed) {
      return resultResponse('NOT_SUBSCRIBED');
    }

    const displayFields = {
      offerTitle: offer.title,
      businessName: (offer.business as { name: string } | null)?.name,
      customerName: customerProfile.full_name ?? null,
    };

    if (dryRun) {
      return resultResponse('VALID', { ...displayFields, previewOnly: true });
    }

    // Atomic claim: only succeeds if the token is still 'available',
    // which is what makes a concurrent double-scan race-safe.
    const { data: claimed } = await admin
      .from('redemption_tokens')
      .update({ status: 'used', used_at: nowIso, used_by: user.id })
      .eq('id', tokenRow.id)
      .eq('status', 'available')
      .select('*')
      .maybeSingle();

    if (!claimed) {
      return resultResponse('ALREADY_USED');
    }

    const { error: insertError } = await admin.from('redemptions').insert({
      token_id: claimed.id,
      customer_id: claimed.customer_id,
      business_id: claimed.business_id,
      offer_id: claimed.offer_id,
      period: claimed.period,
      approved_by: user.id,
    });

    if (insertError) {
      // The token is already claimed at this point; a failure here is a
      // rare accepted edge case for this pass (see plan) rather than
      // something worth rolling back — reconciliation tooling is future
      // work, not built now.
      console.error('Failed to insert redemption after claiming token', insertError);
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    return resultResponse('VALID', { ...displayFields, redeemedAt: nowIso });
  } catch (err) {
    console.error('approve-redemption unexpected error', err);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});
