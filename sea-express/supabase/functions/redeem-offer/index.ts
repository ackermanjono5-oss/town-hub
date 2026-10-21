// Issues a customer's voucher for an offer.
//
// All the rules — membership, a complete profile, the offer being approved
// and live, the business being an eligible paying advertiser, and the
// offer's monthly limit — are enforced inside public.issue_voucher()
// (migration 0011), in one transaction under a per-customer/offer lock.
// Asking again while a voucher is live returns the same voucher, so
// repeated taps never mint extra redemptions.
//
// The response carries both the short code staff can type and a signed QR
// token for camera scanning; either is accepted by approve-redemption.

import { corsHeaders } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabaseAdmin.ts';
import { signQrToken, type QrTokenPayload } from '../_shared/token.ts';

type RedeemErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_SUBSCRIBED'
  | 'PROFILE_INCOMPLETE'
  | 'OFFER_UNAVAILABLE'
  | 'ALREADY_REDEEMED'
  | 'SERVER_ERROR';

// Exceptions raised by issue_voucher(), mapped to client responses.
const ISSUE_ERRORS: Record<string, { status: number; code: RedeemErrorCode; error: string }> = {
  NOT_SUBSCRIBED: { status: 403, code: 'NOT_SUBSCRIBED', error: 'Become a Town Hub member to redeem rewards.' },
  PROFILE_INCOMPLETE: {
    status: 403,
    code: 'PROFILE_INCOMPLETE',
    error: 'Complete your profile (name and phone number) to redeem rewards.',
  },
  OFFER_UNAVAILABLE: { status: 404, code: 'OFFER_UNAVAILABLE', error: 'This offer is no longer available.' },
  ALREADY_REDEEMED: {
    status: 409,
    code: 'ALREADY_REDEEMED',
    error: "You've used this reward the maximum number of times this month. Check back next month!",
  },
};

function errorResponse(status: number, code: RedeemErrorCode, error: string) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to redeem rewards.');
  }

  const userClient = getUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to redeem rewards.');
  }

  let body: { offerId?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body.');
  }
  const offerId = body.offerId;
  if (typeof offerId !== 'string' || offerId.length === 0) {
    return errorResponse(400, 'INVALID_REQUEST', 'offerId is required.');
  }

  const secret = Deno.env.get('QR_TOKEN_SECRET');
  if (!secret) {
    console.error('QR_TOKEN_SECRET is not set');
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }

  const admin = getAdminClient();

  try {
    const { data: tokenRow, error: issueError } = await admin
      .rpc('issue_voucher', { p_customer: user.id, p_offer: offerId })
      .single();

    if (issueError || !tokenRow) {
      const known = Object.keys(ISSUE_ERRORS).find((k) => issueError?.message?.includes(k));
      if (known) {
        const { status, code, error } = ISSUE_ERRORS[known];
        return errorResponse(status, code, error);
      }
      console.error('issue_voucher failed', issueError);
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    const token = tokenRow as {
      id: string;
      customer_id: string;
      business_id: string;
      offer_id: string;
      period: string;
      status: 'available' | 'used' | 'expired';
      issued_at: string;
      expires_at: string;
      code: string;
      offer_title: string | null;
    };

    const payload: QrTokenPayload = {
      tid: token.id,
      cid: token.customer_id,
      bid: token.business_id,
      oid: token.offer_id,
      per: token.period,
      iat: Math.floor(new Date(token.issued_at).getTime() / 1000),
      exp: Math.floor(new Date(token.expires_at).getTime() / 1000),
    };
    const qrToken = await signQrToken(payload, secret);

    return new Response(
      JSON.stringify({
        tokenId: token.id,
        code: token.code,
        qrToken,
        status: token.status,
        period: token.period,
        issuedAt: token.issued_at,
        expiresAt: token.expires_at,
        offerTitle: token.offer_title,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('redeem-offer unexpected error', err);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});
