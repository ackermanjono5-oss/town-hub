/**
 * Navigation that works inside the Android app as well as on the web.
 *
 * The app loads the static export from file:///android_asset/webroot/, and
 * scripts/relativize-export.mjs rewrites the root-relative links in the
 * exported HTML ("/login" → "login.html", "../index.html" …) and sets
 * self.__TH_BASE__ to each page's depth ("", "../", …). Links and
 * redirects created at runtime by client components still say "/login",
 * which under file:// points at the device's filesystem root and fails with
 * ERR_FILE_NOT_FOUND. These helpers apply the same rewrite at runtime.
 *
 * On the web (no relativize step, so no __TH_BASE__) everything is left
 * exactly as written.
 */

declare global {
  interface Window {
    __TH_BASE__?: string;
  }
}

/** True in the relativized export bundled into the Android app. */
export function isAppBuild(): boolean {
  return typeof window !== 'undefined' && typeof window.__TH_BASE__ === 'string';
}

/**
 * Turns a root-relative path into one that resolves inside the app build,
 * mirroring rewritePath() in scripts/relativize-export.mjs:
 * "/" → "index.html", "/rewards/offer?id=1" → "rewards/offer.html?id=1",
 * "/icon.png" stays a file path. Anything else is returned unchanged.
 */
export function appHref(href: string): string {
  if (!isAppBuild() || !href.startsWith('/') || href.startsWith('//')) return href;

  const match = /^([^?#]*)(.*)$/.exec(href);
  const path = match?.[1] ?? href;
  const suffix = match?.[2] ?? '';
  const noSlash = path.replace(/^\/+/, '').replace(/\/+$/, '');

  let file: string;
  if (noSlash === '') file = 'index.html';
  else if (/\.[a-zA-Z0-9]+$/.test(noSlash)) file = noSlash;
  else file = `${noSlash}.html`;

  return `${window.__TH_BASE__ ?? ''}${file}${suffix}`;
}

/** location.href = path, made safe for the app build. */
export function navigateTo(path: string): void {
  window.location.href = appHref(path);
}
