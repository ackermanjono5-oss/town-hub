import { getCurrentUser, getSupabaseClient } from '@/lib/supabase/client';

/**
 * Listing photos: scaled on the phone to at most PHOTO_PX on the long side
 * (a camera's 3–8 MB JPEG becomes ~200–400 KB) and uploaded to the public
 * property-photos bucket under the agent's own folder.
 */

const BUCKET = 'property-photos';
const PHOTO_PX = 1600;
const JPEG_QUALITY = 0.82;

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
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

/** The size to draw a w×h image at so its long side is at most `max`. */
export function fitWithin(w: number, h: number, max = PHOTO_PX): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(w, h));
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

async function downscale(file: File): Promise<Blob> {
  const source = await loadBitmap(file);
  const { width, height } = fitWithin(source.width, source.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the image.');
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  if ('close' in source && typeof source.close === 'function') source.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('Could not prepare the image.');
  return blob;
}

/** Scales and uploads one photo, returning its public URL. */
export async function uploadListingPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  const user = await getCurrentUser();
  if (!user) throw new Error('You are not signed in.');
  const blob = await downscale(file);
  const supabase = getSupabaseClient();
  const name = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(name, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
}

/** The storage path inside the bucket for one of our public photo URLs. */
export function photoPath(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length).split('?')[0]);
}

/** Best effort: removes photos that were taken out of a listing. */
export async function removeListingPhotos(urls: string[]): Promise<void> {
  const paths = urls.map(photoPath).filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  await getSupabaseClient().storage.from(BUCKET).remove(paths);
}
