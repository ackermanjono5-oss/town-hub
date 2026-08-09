'use client';

import { useState } from 'react';
import { Leaf, MapPin, Clock } from 'lucide-react';
import { NATURE_ARTICLES } from '@/lib/garden-route/nature';

export default function NaturePage() {
  const [tab, setTab] = useState<'trails' | 'dyk'>('trails');
  const articles = NATURE_ARTICLES.filter((a) => a.tab === tab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Leaf className="w-9 h-9 text-primary" aria-hidden="true" />
          Nature &amp; Blog
        </h1>
        <p className="text-muted-foreground">Garden Route trails, reserves and stories</p>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        <button
          onClick={() => setTab('trails')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'trails'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Hikes &amp; Trails
        </button>
        <button
          onClick={() => setTab('dyk')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === 'dyk'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Did you know?
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <a
            key={article.slug}
            href={`/nature/${article.slug}`}
            className="p-4 rounded-lg border border-border hover:border-primary card-lift bg-background block"
          >
            <p className="text-xs font-medium text-primary mb-1">{article.category}</p>
            <h3 className="font-semibold text-foreground mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{article.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {article.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {article.readTime}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
