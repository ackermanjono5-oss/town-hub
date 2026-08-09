import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, ExternalLink } from 'lucide-react';
import { NATURE_ARTICLES, getNatureArticle } from '@/lib/garden-route/nature';

export function generateStaticParams() {
  return NATURE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function NatureArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getNatureArticle(slug);
  if (!article) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <a
        href="/nature"
        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Back to Nature &amp; Blog
      </a>

      <p className="text-xs font-medium text-primary mb-2">{article.category}</p>
      <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {article.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {article.readTime}
        </span>
      </div>

      <div className="space-y-4 leading-relaxed">
        {article.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {article.link && (
        <a
          href={article.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          {article.link.label}
        </a>
      )}
    </div>
  );
}
