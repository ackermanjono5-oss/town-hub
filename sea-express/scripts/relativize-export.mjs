// Rewrites the static export (out/) so every page works when opened directly
// via file:// (no HTTP server): root-relative hrefs/srcs ("/login",
// "/_next/...") become correctly-relative ones based on each file's depth.
// Needed because Next's static export always emits root-relative paths,
// which only resolve correctly when served from an HTTP origin.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';

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

// Webpack's runtime publicPath is baked in as an absolute "/_next/" string,
// used by next/link client-side transitions to dynamically fetch other
// pages' JS chunks. That 404s under file://, which silently breaks
// in-app navigation between pages. Making it relative fixes navigation
// between top-level pages (the vast majority of routes here); nested
// dynamic routes (e.g. nature/[slug]) still rely on the full-reload
// fallback for chunks they haven't already loaded.
for (const file of listFiles(OUT_DIR, ['.js'])) {
  if (!basename(file).startsWith('webpack-')) continue;
  let js = readFileSync(file, 'utf8');
  if (js.includes('p="/_next/"')) {
    js = js.replace('p="/_next/"', 'p="_next/"');
    writeFileSync(file, js);
    totalRewrites += 1;
  }
}

console.log(`Rewrote ${totalRewrites} root-relative references across the export.`);
