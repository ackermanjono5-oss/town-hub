// Verifies and redeems a customer's voucher for the signed-in business.
//
// Accepts either the short code staff type in (`code`, e.g. "K7PM-3QXH") or
// the signed QR token (`qrToken`). With `dryRun` it only reports whether the
// voucher is valid, for the confirm screen; without it, it redeems.
//
// Every check and the redemption itself run inside public.redeem_voucher()
// (migration 0011) as one locked transaction, so a voucher can't be
// redeemed twice — not even by two tills at once — and a failure part-way
// never leaves it marked used without a record. If the database can't be
// reached the caller gets an error, never a success.

import { corsHeaders } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabaseAdmin.ts';
import { verifyQrToken } from '../_shared/token.ts';

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
  | 'NOT_SUBSCRIBED'
  | 'LIMIT_REACHED'
  | 'BUSINESS_INELIGIBLE';

const RESULT_MESSAGES: Record<ScanResult, string> = {
  VALID: 'Voucher valid.',
  ALREADY_USED: 'This voucher has already been redeemed.',
  EXPIRED: 'This voucher has expired — ask the customer to generate a new one.',
  INVALID_TOKEN: 'This voucher code was not found. Check the code and try again.',
  WRONG_BUSINESS: 'This voucher is for a different business.',
  OFFER_INACTIVE: 'This reward is no longer active.',
  NOT_SUBSCRIBED: "This customer's Town Hub membership is no longer active.",
  LIMIT_REACHED: 'This customer has already used this reward the maximum number of times this month.',
  BUSINESS_INELIGIBLE:
    'Your business is not currently eligible to redeem rewards. Check your approval and advertising subscription.',
};

// Codes are shown as XXXX-XXXX; staff may type them in any case, with or
// without the dash or spaces.
const CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/;
function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}

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
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to redeem vouchers.');
  }

  const userClient = getUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to redeem vouchers.');
  }

  let body: { code?: unknown; qrToken?: unknown; dryRun?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body.');
  }
  const dryRun = body.dryRun === true;
  const rawCode = typeof body.code === 'string' ? body.code : '';
  const qrToken = typeof body.qrToken === 'string' ? body.qrToken : '';
  if (!rawCode && !qrToken) {
    return errorResponse(400, 'INVALID_REQUEST', 'A voucher code is required.');
  }

  const admin = getAdminClient();

  try {
    // The business this user may redeem for: one they own, or one they're
    // active staff at.
    const { data: ownedBusiness } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    let businessId = ownedBusiness?.id as string | undefined;
    if (!businessId) {
      const { data: employeeRow } = await admin
        .from('employees')
        .select('business_id')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      businessId = employeeRow?.business_id as string | undefined;
    }
    if (!businessId) {
      return errorResponse(403, 'NOT_A_BUSINESS_ACCOUNT', 'This account is not linked to a business.');
    }

    // Resolve the voucher row from whichever form was presented.
    let tokenId: string | null = null;
    if (rawCode) {
      const code = normalizeCode(rawCode);
      if (!CODE_PATTERN.test(code)) return resultResponse('INVALID_TOKEN');
      const { data: tokenRow } = await admin
        .from('redemption_tokens')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      tokenId = tokenRow?.id ?? null;
    } else {
      const secret = Deno.env.get('QR_TOKEN_SECRET');
      if (!secret) {
        console.error('QR_TOKEN_SECRET is not set');
        return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
      }
      const payload = await verifyQrToken(qrToken, secret);
      tokenId = payload?.tid ?? null;
    }
    if (!tokenId) {
      return resultResponse('INVALID_TOKEN');
    }

    const { data: rows, error: redeemError } = await admin.rpc('redeem_voucher', {
      p_token: tokenId,
      p_business: businessId,
      p_staff: user.id,
      p_dry_run: dryRun,
    });
    if (redeemError) {
      console.error('redeem_voucher failed', redeemError);
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    const row = (rows as {
      result: ScanResult;
      offer_title: string | null;
      customer_name: string | null;
      voucher_code: string | null;
      redeemed_at: string | null;
    }[])?.[0];
    if (!row) {
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    const extra: Record<string, unknown> = {
      offerTitle: row.offer_title,
      customerName: row.customer_name,
      code: row.voucher_code,
    };
    if (row.result === 'VALID') {
      if (dryRun) extra.previewOnly = true;
      else extra.redeemedAt = row.redeemed_at;
    }
    return resultResponse(row.result, extra);
  } catch (err) {
    console.error('approve-redemption unexpected error', err);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});
