/**
 * Checks the relativized static export (out/, after relativize-export.mjs)
 * the way the Android app will open it — from files, with no server:
 *
 *   - every page in app/ was exported as an .html file;
 *   - no page still has a root-relative link ("/login"), which would point
 *     at the phone's filesystem root under file://;
 *   - every local file a page links to, loads or styles itself with
 *     actually exists in the export.
 *
 * Run after `npm run build && node scripts/relativize-export.mjs`:
 *   npm run test:export
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
const APP = join(ROOT, 'app');

if (!existsSync(OUT)) {
  console.error('out/ not found: run `npm run build` and `node scripts/relativize-export.mjs` first.');
  process.exit(1);
}

function walk(dir, test, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, test, found);
    else if (test(entry.name)) found.push(full);
  }
  return found;
}

const problems = [];

// 1. Every static route has a page.
const routes = walk(APP, (n) => n === 'page.tsx')
  .map((f) => relative(APP, dirname(f)).replace(/\\/g, '/'))
  .filter((r) => !r.includes('['));
for (const route of routes) {
  const file = route === '' ? 'index.html' : `${route}.html`;
  if (!existsSync(join(OUT, file))) problems.push(`missing page ${file} for route /${route}`);
}

// 2 and 3. Links in every exported page.
const pages = walk(OUT, (n) => n.endsWith('.html'));
const ATTR = /\s(?:href|src)="([^"]+)"/g;
let checked = 0;
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const name = relative(OUT, page).replace(/\\/g, '/');
  for (const [, raw] of html.matchAll(ATTR)) {
    if (/^(?:[a-z]+:|#|\/\/)/i.test(raw)) continue; // http(s), mailto, tel, data, anchors
    if (raw.startsWith('/')) {
      problems.push(`${name}: root-relative link "${raw}"`);
      continue;
    }
    const path = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (!path) continue;
    const target = resolve(dirname(page), path);
    checked += 1;
    if (!existsSync(target) || !statSync(target).isFile()) problems.push(`${name}: broken link "${raw}"`);
  }
}

const unique = [...new Set(problems)];
console.log(`Checked ${routes.length} routes, ${pages.length} pages and ${checked} local references.`);
if (unique.length) {
  console.log(`\n${unique.length} problem(s):`);
  for (const p of unique.slice(0, 50)) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('No problems found.');
