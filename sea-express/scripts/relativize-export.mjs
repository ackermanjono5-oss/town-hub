// Rewrites the static export (out/) so every page works when opened directly
// via file:// (no HTTP server): root-relative hrefs/srcs ("/login",
// "/_next/...") become correctly-relative ones based on each file's depth.
// Needed because Next's static export always emits root-relative paths,
// which only resolve correctly when served from an HTTP origin.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';

const OUT_DIR = join(import.meta.dirname, '..', 'out');

function listFiles(dir, extensions) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full, extensions));
    else if (extensions.some((ext) => entry.name.endsWith(ext))) files.push(full);
  }
  return files;
}

function depthOf(file) {
  const rel = relative(OUT_DIR, dirname(file));
  return rel === '' ? 0 : rel.split(/[\\/]/).length;
}

function rewritePath(rootPath, prefix) {
  // rootPath starts with "/"
  const noSlash = rootPath.slice(1);
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(noSlash);
  if (rootPath === '/') return `${prefix}index.html`;
  if (hasExtension) return `${prefix}${noSlash}`;
  return `${prefix}${noSlash}.html`;
}

let totalRewrites = 0;

for (const file of listFiles(OUT_DIR, ['.html'])) {
  const prefix = '../'.repeat(depthOf(file));
  let html = readFileSync(file, 'utf8');
  let count = 0;
  html = html.replace(/(href|src)="(\/[^"]*)"/g, (match, attr, path) => {
    count += 1;
    return `${attr}="${rewritePath(path, prefix)}"`;
  });

  // The React flight payload is embedded in the HTML as JS string literals,
  // so its asset paths appear escaped — \"/_next/static/css/x.css\" — and
  // the attribute pass above cannot see them. React reads this payload and
  // injects the stylesheet itself, so leaving these absolute means the page
  // renders unstyled under file:// even though the <link> tag was fixed.
  const escaped = html.split('\\"/_next/');
  if (escaped.length > 1) {
    html = escaped.join(`\\"${prefix}_next/`);
    count += escaped.length - 1;
  }

  // Tells the patched webpack runtime (below) how deep this page sits, so
  // chunks it fetches at runtime resolve against the export root rather
  // than the filesystem root. Must run before any Next script.
  if (!html.includes('__TH_BASE__')) {
    const tag = `<script>self.__TH_BASE__=${JSON.stringify(prefix)};</script>`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${tag}`);
      count += 1;
    }
  }

  if (count > 0) {
    writeFileSync(file, html);
    totalRewrites += count;
  }
}

for (const file of listFiles(OUT_DIR, ['.css'])) {
  const prefix = '../'.repeat(depthOf(file));
  let css = readFileSync(file, 'utf8');
  let count = 0;
  css = css.replace(/url\((\/[^)]*)\)/g, (match, path) => {
    count += 1;
    return `url(${rewritePath(path, prefix)})`;
  });
  if (count > 0) {
    writeFileSync(file, css);
    totalRewrites += count;
  }
}

// Webpack's runtime publicPath is baked in as an absolute "/_next/", used
// to fetch CSS and JS chunks after load. That resolves to the filesystem
// root under file:// and 404s, which silently breaks navigation and leaves
// client-loaded pages unstyled.
//
// Patching only webpack-*.js is not enough: main-*.js calls
//   self.__next_set_public_path__(""+t+"/_next/")
// at startup and overwrites it again. So every "/_next/" literal in the
// chunks is rewritten to resolve against __TH_BASE__, the per-page depth
// prefix injected above — which keeps nested routes (nature/[slug])
// correct too, rather than only top-level pages.
// The .txt files are the RSC payloads fetched during client-side
// navigation. They carry the same asset paths as the inline flight data,
// unescaped, and are plain text rather than JS — so they get a direct
// rewrite rather than the runtime expression used for the chunks.
for (const file of listFiles(OUT_DIR, ['.txt'])) {
  const prefix = '../'.repeat(depthOf(file));
  const txt = readFileSync(file, 'utf8');
  const parts = txt.split('"/_next/');
  if (parts.length === 1) continue;
  writeFileSync(file, parts.join(`"${prefix}_next/`));
  totalRewrites += parts.length - 1;
}

const PUBLIC_PATH_EXPR = '((self.__TH_BASE__||"")+"_next/")';

for (const file of listFiles(OUT_DIR, ['.js'])) {
  let js = readFileSync(file, 'utf8');
  if (!js.includes('"/_next/"')) continue;
  const patched = js.split('"/_next/"').join(PUBLIC_PATH_EXPR);
  writeFileSync(file, patched);
  totalRewrites += js.split('"/_next/"').length - 1;
}

console.log(`Rewrote ${totalRewrites} root-relative references across the export.`);
