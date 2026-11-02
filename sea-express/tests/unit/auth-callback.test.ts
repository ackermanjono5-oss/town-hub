import { describe, expect, it } from 'vitest';
import { APP_AUTH_REDIRECT, parseAuthCallback } from '@/lib/auth-callback';

describe('parseAuthCallback', () => {
  it('reads the session Supabase puts in the fragment (implicit flow)', () => {
    expect(
      parseAuthCallback(
        `${APP_AUTH_REDIRECT}#access_token=abc.def&expires_in=3600&refresh_token=r123&token_type=bearer&type=magiclink`
      )
    ).toEqual({ kind: 'tokens', accessToken: 'abc.def', refreshToken: 'r123' });
  });

  it('reads a PKCE code from the query', () => {
    expect(parseAuthCallback(`${APP_AUTH_REDIRECT}?code=xyz-789`)).toEqual({ kind: 'code', code: 'xyz-789' });
  });

  it('reports errors from Supabase or Google', () => {
    expect(
      parseAuthCallback(`${APP_AUTH_REDIRECT}#error=access_denied&error_description=Email+link+is+invalid+or+has+expired`)
    ).toEqual({ kind: 'error', message: 'Email link is invalid or has expired' });
    expect(parseAuthCallback(`${APP_AUTH_REDIRECT}?error=server_error`)).toEqual({
      kind: 'error',
      message: 'server_error',
    });
  });

  it('treats a callback with nothing in it as a failed sign-in', () => {
    expect(parseAuthCallback(APP_AUTH_REDIRECT)?.kind).toBe('error');
  });

  it('ignores links that are not sign-in callbacks', () => {
    expect(parseAuthCallback('https://example.com/#access_token=a&refresh_token=b')).toBeNull();
    expect(parseAuthCallback('tel:112')).toBeNull();
  });
});
