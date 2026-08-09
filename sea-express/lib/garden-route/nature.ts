export interface NatureArticle {
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
export const NATURE_ARTICLES: NatureArticle[] = [];
export function getNatureArticle(slug: string) {
  return NATURE_ARTICLES.find(a => a.slug === slug);
}