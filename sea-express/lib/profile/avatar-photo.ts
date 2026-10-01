import { getCurrentUser, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';

/**
 * Profile photos: capture, downscale, upload, and a local copy so the photo
 * still shows offline.
 *
 * The offline problem. `avatar_url` is an https URL on Supabase Storage. The
 * app runs from file:// with no connectivity much of the time, so that URL
 * renders as a broken image exactly when someone is most likely to be
 * looking at their own profile. Every successful upload therefore also
 * writes a downscaled copy to localStorage, and the UI prefers that copy.
 * The remote URL is what makes the photo follow the member to another
 * device; the local copy is what makes it appear at all.
 *
 * The size problem. A modern phone camera produces a 3–8 MB JPEG. Uploading
 * that to show a 80px circle wastes the member's data and would blow the
 * bucket's 2 MB limit. Everything is centre-cropped to a square and scaled
 * to AVATAR_PX before it leaves the device, which lands around 15–30 KB.
 */

const AVATAR_PX = 256;
const JPEG_QUALITY = 0.85;
const CACHE_PREFIX = 'townhub:avatar:';

/** Largest data URL we will keep locally (~400 KB of base64). */
const MAX_CACHE_CHARS = 400_000;

export function cachedPhoto(userId: string): string | null {
  try {
    return window.localStorage.getItem(CACHE_PREFIX + userId);
  } catch {
    return null;
  }
}

function cachePhoto(userId: string, dataUrl: string) {
  try {
    if (dataUrl.length <= MAX_CACHE_CHARS) {
      window.localStorage.setItem(CACHE_PREFIX + userId, dataUrl);
    }
  } catch {
    /* private window, or quota — the remote URL still works online */
  }
}

export function clearCachedPhoto(userId: string) {
  try {
    window.localStorage.removeItem(CACHE_PREFIX + userId);
  } catch {
    /* ignore */
  }
}

/**
 * Centre-crops to a square and scales to AVATAR_PX, returning a JPEG blob
 * and its data URL. Uses createImageBitmap where available — it decodes off
 * the main thread, so a large photo does not freeze the UI — and falls back
 * to an <img> decode.
 */
async function downscale(file: File): Promise<{ blob: Blob; dataUrl: string }> {
  const source = await loadBitmap(file);
  const side = Math.min(source.width, source.height);
  const sx = (source.width - side) / 2;
  const sy = (source.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_PX;
  canvas.height = AVATAR_PX;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the image.');
  ctx.drawImage(source as CanvasImageSource, sx, sy, side, side, 0, 0, AVATAR_PX, AVATAR_PX);
  if ('close' in source && typeof source.close === 'function') source.close();

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );
  if (!blob) throw new Error('Could not prepare the image.');
  return { blob, dataUrl };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through to the <img> path */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('That file is not an image we can read.'));
      img.src = url;
    });
  } finally {
    // Safe here: drawImage has already read the decoded pixels by the time
    // the caller returns, and revoking early avoids leaking the blob URL.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

export interface PhotoResult {
  /** Public URL stored on the profile, or null if the upload failed. */
  url: string | null;
  /** Local copy, shown immediately and used offline. */
  dataUrl: string;
  /** Set when the photo could not be uploaded. */
  error?: string;
}

/**
 * Processes and uploads a chosen photo. Resolves with the local copy even
 * when the upload fails, so the caller can decide whether to keep it.
 */
export async function uploadAvatarPhoto(file: File): Promise<PhotoResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const { blob, dataUrl } = await downscale(file);

  if (!isSupabaseConfigured) {
    return { url: null, dataUrl, error: 'Sign-in is not configured.' };
  }

  const user = await getCurrentUser();
  if (!user) return { url: null, dataUrl, error: 'You are not signed in.' };

  const supabase = getSupabaseClient();
  // Fixed path per user so a new photo replaces the old one rather than
  // accumulating orphans the app would never clean up.
  const path = `${user.id}/avatar.jpg`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

  if (error) {
    return { url: null, dataUrl, error: error.message };
  }

  cachePhoto(user.id, dataUrl);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-buster: the path is reused, so without it the CDN and the
  // WebView both keep serving the previous photo.
  return { url: `${data.publicUrl}?v=${Date.now()}`, dataUrl };
}

/** Removes the stored photo, falling back to the picked illustration. */
export async function removeAvatarPhoto(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return 'You are not signed in.';

  clearCachedPhoto(user.id);
  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);
  // A missing object is not a failure — the member wanted it gone either way.
  if (error && !/not found/i.test(error.message)) return error.message;
  return null;
}
