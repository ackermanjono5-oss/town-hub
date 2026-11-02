import { Globe, Newspaper } from 'lucide-react';
import { NEWS_OUTLETS } from '@/lib/garden-route/news';
import PageHero from '@/components/PageHero';
import { Newspaper as HeroIcon } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="News"
        subtitle="Local news outlets covering the Garden Route"
        icon={HeroIcon}
        theme="slate"
        className="mb-8"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NEWS_OUTLETS.map((outlet) => (
          <div
            key={outlet.id}
            className="p-4 rounded-lg border border-border hover:border-primary card-lift bg-background flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-foreground text-lg">{outlet.name}</h3>
              <Newspaper className="w-5 h-5 text-primary opacity-70" aria-hidden="true" />
            </div>
            
            <p className="text-sm font-medium text-[#b45309] dark:text-amber-400 mb-3">{outlet.coverage}</p>
            <p className="text-sm text-muted-foreground flex-grow mb-4">
              {outlet.description}
            </p>

            <div className="mt-auto">
              <a
                href={outlet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                Read News
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
