import { corsHeaders } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabaseAdmin.ts';
import { signQrToken, TOKEN_TTL_SECONDS, type QrTokenPayload } from '../_shared/token.ts';
import { currentPeriod } from '../_shared/period.ts';

type RedeemErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'NOT_SUBSCRIBED'
  | 'OFFER_UNAVAILABLE'
  | 'ALREADY_REDEEMED'
  | 'SERVER_ERROR';

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

  const admin = getAdminClient();

  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('is_subscribed')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.is_subscribed) {
      return errorResponse(403, 'NOT_SUBSCRIBED', 'Become a Town Hub member to redeem rewards.');
    }

    const nowIso = new Date().toISOString();
    const { data: offer } = await admin
      .from('offers')
      .select('id, business_id, is_active, starts_at, ends_at, businesses!inner(is_active)')
      .eq('id', offerId)
      .eq('is_active', true)
      .eq('businesses.is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .maybeSingle();

    if (!offer) {
      return errorResponse(404, 'OFFER_UNAVAILABLE', 'This offer is no longer available.');
    }

    const period = currentPeriod();

    const { data: existingRedemption } = await admin
      .from('redemptions')
      .select('id')
      .eq('customer_id', user.id)
      .eq('offer_id', offerId)
      .eq('period', period)
      .maybeSingle();

    if (existingRedemption) {
      return errorResponse(
        409,
        'ALREADY_REDEEMED',
        "You've already redeemed this offer this month. Check back next month!"
      );
    }

    // Idempotent reuse: repeated "Redeem Now" taps within the TTL window
    // return the same token instead of minting a fresh row each time.
    const { data: liveToken } = await admin
      .from('redemption_tokens')
      .select('*')
      .eq('customer_id', user.id)
      .eq('offer_id', offerId)
      .eq('period', period)
      .eq('status', 'available')
      .gt('expires_at', nowIso)
      .maybeSingle();

    const secret = Deno.env.get('QR_TOKEN_SECRET');
    if (!secret) {
      console.error('QR_TOKEN_SECRET is not set');
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
    }

    let tokenRow = liveToken;
    if (!tokenRow) {
      const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();
      const { data: inserted, error: insertError } = await admin
        .from('redemption_tokens')
        .insert({
          customer_id: user.id,
          business_id: offer.business_id,
          offer_id: offerId,
          period,
          status: 'available',
          expires_at: expiresAt,
        })
        .select('*')
        .single();

      if (insertError || !inserted) {
        console.error('Failed to insert redemption token', insertError);
        return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
      }
      tokenRow = inserted;
    }

    const payload: QrTokenPayload = {
      tid: tokenRow.id,
      cid: tokenRow.customer_id,
      bid: tokenRow.business_id,
      oid: tokenRow.offer_id,
      per: tokenRow.period,
      iat: Math.floor(new Date(tokenRow.issued_at).getTime() / 1000),
      exp: Math.floor(new Date(tokenRow.expires_at).getTime() / 1000),
    };
    const qrToken = await signQrToken(payload, secret);

    return new Response(
      JSON.stringify({
        tokenId: tokenRow.id,
        qrToken,
        status: tokenRow.status,
        period: tokenRow.period,
        issuedAt: tokenRow.issued_at,
        expiresAt: tokenRow.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('redeem-offer unexpected error', err);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});
