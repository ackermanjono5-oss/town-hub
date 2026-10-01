// Compact signed QR token: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature).
// Built on Deno's native Web Crypto API — no JWT library needed for a
// single fixed-shape payload. Verified again by the future Phase 2
// approve-redemption function; the DB `status` column (not this
// signature) is what actually enforces single-use.

export interface QrTokenPayload {
  tid: string; // redemption_tokens.id
  cid: string; // customer profile id
  bid: string; // business id
  oid: string; // offer id
  per: string; // period, 'YYYY-MM-01'
  iat: number; // issued-at, unix seconds
  exp: number; // expiry, unix seconds
}

// 8 minutes: short enough to blunt screenshot/replay reuse, long enough
// that a customer queued at the till doesn't watch it expire mid-wait.
export const TOKEN_TTL_SECONDS = 480;

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signQrToken(payload: QrTokenPayload, secret: string): Promise<string> {
  const key = await hmacKey(secret);
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, payloadBytes));
  return `${base64url(payloadBytes)}.${base64url(signature)}`;
}

// Returns null on any malformed/invalid-signature/expired token — callers
// treat null as "reject", never distinguishing the reason to the client.
export async function verifyQrToken(token: string, secret: string): Promise<QrTokenPayload | null> {
  const [payloadPart, sigPart] = token.split('.');
  if (!payloadPart || !sigPart) return null;

  const key = await hmacKey(secret);
  const payloadBytes = fromBase64url(payloadPart);
  const signatureBytes = fromBase64url(sigPart);

  const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, payloadBytes);
  if (!valid) return null;

  let payload: QrTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }

  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
