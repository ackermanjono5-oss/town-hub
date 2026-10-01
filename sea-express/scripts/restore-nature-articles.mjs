/**
 * Rebuilds lib/garden-route/nature.ts from the rendered article pages that
 * survive in public/nature/.
 *
 * NATURE_ARTICLES was emptied at some point before this repo's single commit
 * ("Recovered fully updated codebase"), leaving the Nature page blank and the
 * /nature/[slug] route with nothing to pre-render — which also broke
 * `next build`, since output: 'export' rejects a dynamic route whose
 * generateStaticParams returns an empty array.
 *
 * The ten articles were still sitting in public/nature/*.html: those are the
 * pages the previous export produced, so the prose is the real thing rather
 * than anything reconstructed. This parses them back into data.
 *
 * Run:  node scripts/restore-nature-articles.mjs
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'public', 'nature');
const OUT_FILE = join(ROOT, 'lib', 'garden-route', 'nature.ts');

/** Entities the rendered pages actually contain. */
function decode(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Emits a single-quoted JS string literal. Newlines must be escaped too:
 * `content` joins paragraphs with real line breaks, and an unescaped one
 * terminates the literal mid-value and breaks the generated file.
 */
const ts = (v) =>
  `'${String(v)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n')}'`;

function parseArticle(slug, html) {
  const category = decode(
    /<p class="text-xs font-medium text-primary mb-2">([\s\S]*?)<\/p>/.exec(html)?.[1] ?? ''
  );
  const title = decode(
    /<h1 class="text-3xl font-bold mb-3">([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? ''
  );

  // Location and read time are the two spans in the meta row, each sitting
  // after its own icon, so take the text that follows each </svg>.
  const meta = /<div class="flex items-center gap-4 text-sm text-muted-foreground mb-6">([\s\S]*?)<\/div>/.exec(html)?.[1] ?? '';
  const metaBits = [...meta.matchAll(/<\/svg>([\s\S]*?)<\/span>/g)].map((m) => decode(m[1]));
  const [location = '', readTime = ''] = metaBits;

  const bodyBlock = /<div class="space-y-4 leading-relaxed">([\s\S]*?)<\/div>/.exec(html)?.[1] ?? '';
  const body = [...bodyBlock.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => decode(m[1]))
    .filter(Boolean);

  // Optional outbound link, rendered after the body with an ExternalLink icon.
  const linkMatch = /<a href="(https?:[^"]+)"[^>]*class="mt-6[^"]*"[^>]*>([\s\S]*?)<\/a>/.exec(html);
  const link = linkMatch
    ? { url: linkMatch[1].replace(/&amp;/g, '&'), label: decode(linkMatch[2]) }
    : null;

  if (!title || body.length === 0) return null;

  // The Nature page splits on this: "Did you know?" pieces vs walks.
  const tab = /did you know/i.test(category) ? 'dyk' : 'trails';

  return { slug, category, title, location, readTime, body, link, tab };
}

function render(articles) {
  const entries = articles
    .map((a) => {
      const lines = [
        `    slug: ${ts(a.slug)},`,
        `    category: ${ts(a.category)},`,
        `    title: ${ts(a.title)},`,
        `    location: ${ts(a.location)},`,
        `    readTime: ${ts(a.readTime)},`,
        `    tab: ${ts(a.tab)},`,
        `    body: [\n${a.body.map((p) => `      ${ts(p)},`).join('\n')}\n    ],`,
        `    summary: ${ts(a.body[0].slice(0, 160))},`,
        `    excerpt: ${ts(a.body[0].slice(0, 160))},`,
        `    content: ${ts(a.body.join('\n\n'))},`,
      ];
      if (a.link) {
        lines.push(`    link: { url: ${ts(a.link.url)}, label: ${ts(a.link.label)} },`);
      }
      return `  {\n${lines.join('\n')}\n  }`;
    })
    .join(',\n');

  return `export interface NatureArticle {
  slug: string;
  category: string;
  title: string;
  location: string;
  readTime: string;
  body: string[];
  link?: {
    url: string;
    label: string;
  };
  summary: string;
  content: string;
  image?: string;
  tab?: 'trails' | 'dyk';
  excerpt?: string;
}

// Recovered by scripts/restore-nature-articles.mjs from the rendered pages in
// public/nature/, which survived after this array was emptied. Re-run that
// script rather than editing by hand.
export const NATURE_ARTICLES: NatureArticle[] = [
${entries},
];

export function getNatureArticle(slug: string) {
  return NATURE_ARTICLES.find((a) => a.slug === slug);
}
`;
}

async function main() {
  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.html'));
  const articles = [];

  for (const file of files.sort()) {
    const slug = basename(file, '.html');
    const html = await readFile(join(SRC_DIR, file), 'utf8');
    const article = parseArticle(slug, html);
    if (!article) {
      console.warn(`  skip  ${slug} — no title or body found`);
      continue;
    }
    articles.push(article);
    console.log(
      `  ok    ${slug.padEnd(30)} ${article.body.length} paragraphs  [${article.tab}]`
    );
  }

  await writeFile(OUT_FILE, render(articles), 'utf8');
  console.log(`\nRestored ${articles.length} articles to ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
