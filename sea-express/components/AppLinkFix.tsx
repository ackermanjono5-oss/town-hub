'use client';

import { useEffect } from 'react';
import { appHref, isAppBuild } from '@/lib/app-nav';

/**
 * Inside the Android app, catches taps on root-relative links ("/login",
 * "/business/register") that client components render after the page has
 * loaded — the export step only rewrites links already in the HTML — and
 * sends them to the matching bundled file instead of the device root. See
 * lib/app-nav.ts. Renders nothing, and does nothing on the web.
 */
export default function AppLinkFix() {
  useEffect(() => {
    if (!isAppBuild()) return;

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href') ?? '';
      const fixed = appHref(href);
      if (fixed === href) return;

      event.preventDefault();
      window.location.href = fixed;
    }

    // Capture phase, so this runs before any other click handling.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
