/**
 * Turns a folder of logo files into working logos. No commands, no code.
 *
 *   Save a logo as  public/logos/supplied/<business-name>.png
 *
 * That is the whole job. This runs automatically before `npm run dev` and
 * `npm run build` (see the predev/prebuild scripts in package.json), so a file
 * dropped in that folder is live the next time the app starts.
 *
 * What it does with each file:
 *   - trims the flat border the logo was exported with, sampling the actual
 *     corner colour (a "black" plate is usually #111, and trimming against
 *     pure black would find nothing to remove),
 *   - pads it out to a banner shape in that same colour, so a white-on-dark
 *     mark fills the card instead of floating as a small square,
 *   - writes the result to public/logos/ready/ and leaves your original
 *     untouched, so re-running never re-crops an already-cropped image,
 *   - regenerates lib/garden-route/supplied-logos.ts with a matching rule.
 *
 * Filename -> match rule: hyphens become flexible separators, so
 * `mugg-bean.png` matches "Mugg & Bean", "Mugg And Bean" and "Mugg Bean".
 * Names are word-bounded, so `enrico.png` will not match "Enricos Auto".
 *
 * Supplied logos beat every fetched logo and apply to Restaurants, Businesses,
 * Hotels & B&Bs and Medical at once. public/logos/supplied/ is the one logo
 * folder no fetch script ever deletes.
 */

import { mkdir, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'public', 'logos', 'supplied');
const OUT_DIR = join(ROOT, 'public', 'logos', 'ready');
const OUT_FILE = join(ROOT, 'lib', 'garden-route', 'supplied-logos.ts');

const ALLOWED = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);
const MAX_W = 900;
const MAX_H = 260;
/** Card banners are wide; padding to this ratio stops logos looking stranded. */
const TARGET_RATIO = 3.2;

const esc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * `mugg-bean` -> \bmugg\W*(?:and\W*)?bean\b — covers the "&", "and" and
 * plain-space spellings OpenStreetMap records for the same business.
 */
function patternFor(slug) {
  const words = slug.split('-').filter(Boolean).map(esc);
  if (words.length === 0) return null;
  return `\\b${words.join('\\W*(?:and\\W*)?')}\\b`;
}

const isDark = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b < 70;

async function process(srcPath) {
  const input = await readFile(srcPath);

  // Sample the top-left pixel: that is the plate the logo was exported on.
  const { data, info } = await sharp(input).raw().toBuffer({ resolveWithObject: true });
  const [r, g, b] = [data[0], data[1], data[2]];
  const hasAlpha = info.channels === 4;
  const transparentCorner = hasAlpha && data[3] < 16;
  const corner = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  const dark = !transparentCorner && isDark(r, g, b);

  let img = sharp(input);
  if (!transparentCorner) {
    try {
      const trimmed = await sharp(input).trim({ background: corner, threshold: 20 }).toBuffer();
      const meta = await sharp(trimmed).metadata();
      // Trim can eat everything on a low-contrast logo — keep the original then.
      if (meta.width > 8 && meta.height > 8) img = sharp(trimmed);
    } catch {
      /* not trimmable — use as-is */
    }
  }

  const fitted = await img
    .resize({ width: MAX_W, height: MAX_H, fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  const m = await sharp(fitted).metadata();

  // Pad out to a banner shape so the card's wide logo slot is filled.
  const targetW = Math.max(m.width, Math.round(m.height * TARGET_RATIO));
  const padX = Math.max(0, Math.round((targetW - m.width) / 2));
  const padY = Math.round(m.height * 0.18);
  const background = dark
    ? { ...hexToRgb(corner), alpha: 1 }
    : { r: 255, g: 255, b: 255, alpha: 0 };

  const out = await sharp(fitted)
    .extend({ top: padY, bottom: padY, left: padX, right: padX, background })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { out, note: dark ? `dark plate ${corner}` : 'transparent' };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Skip work when the processed file is already newer than the source. */
async function isFresh(srcPath, outPath) {
  try {
    const [a, b] = await Promise.all([stat(srcPath), stat(outPath)]);
    return b.mtimeMs >= a.mtimeMs;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(SRC_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR)).filter((f) => ALLOWED.has(extname(f).toLowerCase()));
  const entries = [];

  for (const file of files.sort()) {
    const slug = basename(file, extname(file)).toLowerCase();
    const pattern = patternFor(slug);
    if (!pattern) {
      console.warn(`  skip  ${file} — filename has no usable words`);
      continue;
    }

    const srcPath = join(SRC_DIR, file);
    const isSvg = extname(file).toLowerCase() === '.svg';
    const outName = isSvg ? `${slug}.svg` : `${slug}.png`;
    const outPath = join(OUT_DIR, outName);

    if (await isFresh(srcPath, outPath)) {
      entries.push({ pattern, outName });
      console.log(`  ok    ${slug.padEnd(22)} (unchanged)`);
      continue;
    }

    if (isSvg) {
      await writeFile(outPath, await readFile(srcPath));
      entries.push({ pattern, outName });
      console.log(`  ok    ${slug.padEnd(22)} svg copied`);
      continue;
    }

    const { out, note } = await process(srcPath);
    await writeFile(outPath, out);
    const meta = await sharp(out).metadata();
    entries.push({ pattern, outName });
    console.log(`  ok    ${slug.padEnd(22)} ${meta.width}x${meta.height}  ${note}`);
  }

  const rows = entries
    .map((e) => `  { pattern: /${e.pattern}/i, logo: 'logos/ready/${e.outName}' },`)
    .join('\n');

  await writeFile(
    OUT_FILE,
    `// Generated by scripts/scan-supplied-logos.mjs — do not edit by hand.
//
// To add a logo: save it as public/logos/supplied/<business-name>.png
// Nothing else. This regenerates automatically before \`npm run dev\` and
// \`npm run build\`.
//
// The filename becomes the match rule, so mugg-bean.png matches "Mugg & Bean",
// "Mugg And Bean" and "Mugg Bean". These win over every fetched logo and apply
// to Restaurants, Businesses, Hotels & B&Bs and Medical at once.
export const SUPPLIED_LOGOS: { pattern: RegExp; logo: string }[] = [
${rows}
];

export function getSuppliedLogo(name: string): string | undefined {
  return SUPPLIED_LOGOS.find((s) => s.pattern.test(name))?.logo;
}
`,
    'utf8'
  );

  const label = entries.length === 1 ? 'logo' : 'logos';
  console.log(`  ${entries.length} supplied ${label} ready.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
