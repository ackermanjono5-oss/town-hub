/**
 * Picked avatars for member profiles.
 *
 * Drawn as inline SVG rather than shipped as image files: the app runs
 * offline from file:// inside a WebView, so anything fetched at runtime is a
 * broken image, and twelve bundled PNGs would be twelve more assets to keep
 * in the APK. Inline paths cost nothing, stay sharp at any size, and can be
 * recoloured from the palette.
 *
 * The set is Garden Route rather than generic — a whale, a protea, the
 * Outeniquas — so a member's avatar looks like it belongs to this app.
 *
 * AVATARS is the source of truth: the stored `avatar` column holds one of
 * these ids, and an id that is no longer in the list falls back to initials
 * rather than rendering blank.
 */

export interface AvatarDef {
  id: string;
  label: string;
  /** Background gradient stops, light → dark. */
  from: string;
  to: string;
  /** Mark drawn on top, in a 0 0 24 24 viewBox. */
  path: React.ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const AVATARS: AvatarDef[] = [
  {
    id: 'whale',
    label: 'Whale',
    from: '#0ea5e9',
    to: '#0369a1',
    path: (
      <g {...stroke}>
        <path d="M3 13c3.5 0 4.5-3 8-3s4.5 3 8 3c0 3.3-3.6 5-8 5s-8-1.7-8-5Z" />
        <path d="M19 13c1.2-1 2-2.2 2-3.5" />
        <circle cx="8.5" cy="13.5" r="0.7" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    id: 'protea',
    label: 'Protea',
    from: '#f472b6',
    to: '#be185d',
    path: (
      <g {...stroke}>
        <path d="M12 5c1.8 2 2.8 4 2.8 6a2.8 2.8 0 1 1-5.6 0c0-2 1-4 2.8-6Z" />
        <path d="M9.2 11C7.4 10 5.8 9.6 4.4 9.8c.4 1.6 1.4 3 2.8 4" />
        <path d="M14.8 11c1.8-1 3.4-1.4 4.8-1.2-.4 1.6-1.4 3-2.8 4" />
        <path d="M12 14v5" />
      </g>
    ),
  },
  {
    id: 'mountain',
    label: 'Outeniqua',
    from: '#34d399',
    to: '#047857',
    path: (
      <g {...stroke}>
        <path d="M3 18l5.5-8L12 15l2.5-3.5L21 18H3Z" />
        <circle cx="17" cy="7" r="1.8" />
      </g>
    ),
  },
  {
    id: 'wave',
    label: 'Wave',
    from: '#22d3ee',
    to: '#0e7490',
    path: (
      <g {...stroke}>
        <path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
        <path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
      </g>
    ),
  },
  {
    id: 'lighthouse',
    label: 'Lighthouse',
    from: '#fbbf24',
    to: '#b45309',
    path: (
      <g {...stroke}>
        <path d="M10 10h4l1 9H9l1-9Z" />
        <path d="M10.5 7h3l.5 3h-4l.5-3Z" />
        <path d="M12 4v1" />
        <path d="M16 8l2-1M8 8L6 7" />
      </g>
    ),
  },
  {
    id: 'dolphin',
    label: 'Dolphin',
    from: '#60a5fa',
    to: '#1d4ed8',
    path: (
      <g {...stroke}>
        <path d="M4 16c4 1 8-1 10-4 1.4-2 2.6-3.4 5-4-.6 3-1.4 4.6-2.6 6" />
        <path d="M11 13c-1.6 1.6-3.6 2.4-6 2.6" />
        <circle cx="16.2" cy="9.4" r="0.6" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    id: 'fynbos',
    label: 'Fynbos',
    from: '#a78bfa',
    to: '#6d28d9',
    path: (
      <g {...stroke}>
        <path d="M12 19V9" />
        <path d="M12 12c-2-1-3-2.6-3-4.6 2 .2 3.4 1.4 4 3" />
        <path d="M12 14c2-1 3-2.6 3-4.6-2 .2-3.4 1.4-4 3" />
        <path d="M9 19h6" />
      </g>
    ),
  },
  {
    id: 'sun',
    label: 'Sunrise',
    from: '#fde047',
    to: '#ea580c',
    path: (
      <g {...stroke}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
      </g>
    ),
  },
  {
    id: 'boat',
    label: 'Boat',
    from: '#f87171',
    to: '#b91c1c',
    path: (
      <g {...stroke}>
        <path d="M4 16h16l-2 3H6l-2-3Z" />
        <path d="M12 14V5l5 9h-5Z" />
        <path d="M11 14H7l4-5" />
      </g>
    ),
  },
  {
    id: 'bird',
    label: 'Loerie',
    from: '#4ade80',
    to: '#15803d',
    path: (
      <g {...stroke}>
        <path d="M5 14c2.6 0 5-1.4 6.4-3.6C12.6 8.6 14 7 16.4 7c1.6 0 2.6 1 2.6 2.4 0 3.4-3.4 7.6-8 7.6-3 0-5-1.4-6-3Z" />
        <circle cx="16.4" cy="9.4" r="0.6" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  {
    id: 'forest',
    label: 'Forest',
    from: '#2dd4bf',
    to: '#115e59',
    path: (
      <g {...stroke}>
        <path d="M9 4l4 6h-2.5l3 5H5.5l3-5H6l3-6Z" />
        <path d="M9 15v4" />
        <path d="M16 9l3 5h-6l3-5Z" />
        <path d="M16 14v5" />
      </g>
    ),
  },
  {
    id: 'star',
    label: 'Southern Cross',
    from: '#818cf8',
    to: '#3730a3',
    path: (
      <g {...stroke}>
        <path d="M12 4l1.6 3.6L17 9l-3.4 1.4L12 14l-1.6-3.6L7 9l3.4-1.4L12 4Z" />
        <circle cx="17.5" cy="16" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="7" cy="17" r="0.7" fill="currentColor" stroke="none" />
      </g>
    ),
  },
];

export function getAvatar(id: string | null | undefined): AvatarDef | undefined {
  if (!id) return undefined;
  return AVATARS.find((a) => a.id === id);
}

/** Initials from a name, falling back to the local part of an email. */
export function initialsOf(name: string | null | undefined, email = ''): string {
  const source = (name ?? '').trim() || email;
  const parts = source
    .replace(/@.*$/, '')
    .split(/[\s._-]+/)
    .filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]).join('');
  return (letters || source[0] || '?').toUpperCase();
}

export default function Avatar({
  avatarId,
  photo,
  name,
  email,
  size = 64,
  className = '',
}: {
  avatarId?: string | null;
  /**
   * An uploaded profile photo. Pass the locally cached data URL where one
   * exists — an https avatar_url cannot load offline from file://, which is
   * exactly when someone is most likely looking at their own profile.
   */
  photo?: string | null;
  name?: string | null;
  email?: string;
  size?: number;
  className?: string;
}) {
  const def = getAvatar(avatarId);
  const gradientId = `av-${def?.id ?? 'initials'}`;

  if (photo) {
    return (
      /* Plain <img>: next/image cannot optimise a data URL, and the static
         export has no optimiser anyway. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        className={`rounded-2xl object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (!def) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.34 }}
        aria-hidden="true"
      >
        {initialsOf(name, email)}
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`rounded-2xl ${className}`}
      role="img"
      aria-label={`${def.label} avatar`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={def.from} />
          <stop offset="100%" stopColor={def.to} />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${gradientId})`} />
      <g className="text-white">{def.path}</g>
    </svg>
  );
}
