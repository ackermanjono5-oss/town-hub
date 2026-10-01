import { corsHeaders } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabaseAdmin.ts';

type RegisterBusinessErrorCode =
  | 'UNAUTHENTICATED'
  | 'INVALID_REQUEST'
  | 'INVALID_CODE'
  | 'CODE_ALREADY_USED'
  | 'BUSINESS_ALREADY_CLAIMED'
  | 'SERVER_ERROR';

function errorResponse(status: number, code: RegisterBusinessErrorCode, error: string) {
  return new Response(JSON.stringify({ error, code }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Maps the exception text raised by register_business_with_code(...) to
// the matching HTTP status/code. Any unrecognized message falls through
// to SERVER_ERROR rather than leaking a raw Postgres error to the client.
function mapRpcError(message: string): { status: number; code: RegisterBusinessErrorCode; error: string } {
  if (message.includes('INVALID_CODE')) {
    return { status: 404, code: 'INVALID_CODE', error: 'That registration code was not found.' };
  }
  if (message.includes('CODE_ALREADY_USED')) {
    return { status: 409, code: 'CODE_ALREADY_USED', error: 'That registration code has already been used.' };
  }
  if (message.includes('BUSINESS_ALREADY_CLAIMED')) {
    return {
      status: 409,
      code: 'BUSINESS_ALREADY_CLAIMED',
      error: 'This business has already been claimed by another account.',
    };
  }
  return { status: 500, code: 'SERVER_ERROR', error: 'Something went wrong. Please try again.' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to register your business.');
  }

  const userClient = getUserClient(authHeader);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return errorResponse(401, 'UNAUTHENTICATED', 'Sign in to register your business.');
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'Invalid request body.');
  }
  const rawCode = body.code;
  if (typeof rawCode !== 'string' || rawCode.trim().length === 0) {
    return errorResponse(400, 'INVALID_REQUEST', 'A registration code is required.');
  }
  const code = rawCode.trim().toUpperCase();

  const admin = getAdminClient();

  try {
    const { data, error } = await admin
      .rpc('register_business_with_code', { p_code: code, p_owner_id: user.id })
      .single();

    if (error || !data) {
      const mapped = mapRpcError(error?.message ?? '');
      return errorResponse(mapped.status, mapped.code, mapped.error);
    }

    const business = data as { id: string; name: string };
    return new Response(JSON.stringify({ businessId: business.id, name: business.name }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('register-business unexpected error', err);
    return errorResponse(500, 'SERVER_ERROR', 'Something went wrong. Please try again.');
  }
});
