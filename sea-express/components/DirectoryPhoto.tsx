import Image from 'next/image';

/**
 * Building/premises photo banner for a directory card.
 *
 * Rendered inline rather than as a hover-only popover on purpose: the app
 * ships as a WebView APK, and a touch screen has no hover state, so a
 * hover-only photo would be invisible to most users. The photo is always
 * shown when one exists and zooms slightly on hover on desktop, which is
 * the closest equivalent that still works on a phone.
 *
 * Renders nothing when a listing has no photo, so cards without one are
 * unchanged.
 */
export default function DirectoryPhoto({
  src,
  alt,
  className = '',
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) return null;

  return (
    <div className={`relative w-full aspect-[16/9] overflow-hidden bg-secondary ${className}`}>
      <Image
        src={src}
        alt={`${alt} — building exterior`}
        fill
        sizes="(min-width: 768px) 24rem, 100vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
