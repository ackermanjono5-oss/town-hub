/**
 * Signing in from inside the Android app.
 *
 * The app's pages are files (file://), so a sign-in that ends with a
 * redirect has nowhere to land in the WebView, and Google refuses to sign
 * in inside embedded WebViews at all. Instead, Google sign-in and emailed
 * sign-in links open in the phone's browser and finish by redirecting to
 * APP_AUTH_REDIRECT, a townhub:// link the app is registered for. The app
 * (sea-express-expo/App.js) hands that link to the page, which reads the
 * session out of it with parseAuthCallback and stores it.
 *
 * Supabase only redirects to addresses on its allow-list, so
 * APP_AUTH_REDIRECT must be added under Authentication → URL Configuration
 * → Redirect URLs in the Supabase dashboard.
 */
export const APP_AUTH_REDIRECT = 'townhub://auth/callback';

export type AuthCallback =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'code'; code: string }
  | { kind: 'error'; message: string };

/**
 * What a townhub://auth/callback link carries. Supabase puts the session in
 * the fragment (#access_token=…&refresh_token=…) for the implicit flow, a
 * ?code=… for PKCE, and error / error_description when sign-in failed.
 * Returns null for links that aren't sign-in callbacks.
 */
export function parseAuthCallback(url: string): AuthCallback | null {
  if (!url.startsWith('townhub://auth')) return null;
  const queryStart = url.indexOf('?');
  const hashStart = url.indexOf('#');
  const query =
    queryStart === -1 ? '' : url.slice(queryStart + 1, hashStart > queryStart ? hashStart : undefined);
  const hash = hashStart === -1 ? '' : url.slice(hashStart + 1);
  const params = new URLSearchParams(query);
  new URLSearchParams(hash).forEach((value, key) => params.set(key, value));

  const error = params.get('error_description') || params.get('error');
  if (error) return { kind: 'error', message: error.replace(/\+/g, ' ') };

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) return { kind: 'tokens', accessToken, refreshToken };

  const code = params.get('code');
  if (code) return { kind: 'code', code };

  return { kind: 'error', message: 'The sign-in link was incomplete. Please try again.' };
}

/** True in the bundled Android app, where pages are loaded from file://. */
export function isFileProtocol(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'file:';
}
