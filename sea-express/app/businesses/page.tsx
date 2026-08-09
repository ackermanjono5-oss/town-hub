'use client';

import { useMemo, useState } from 'react';
import { MapPin, Phone, Globe, Search, Store } from 'lucide-react';
import { TOWNS } from '@/lib/garden-route/towns';
import {
  BUSINESSES,
  BUSINESS_CATEGORIES,
  getBusinessesByTown,
  getBusinessMapsUrl,
} from '@/lib/garden-route/businesses';

export default function BusinessesPage() {
  const [town, setTown] = useState<string>('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const businesses = useMemo(() => {
    let inTown = town === 'all' ? BUSINESSES : getBusinessesByTown(town);
    if (category !== 'all') {
      inTown = inTown.filter((b) => b.category === category);
    }
    const query = search.trim().toLowerCase();
    if (!query) return inTown;
    return inTown.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)
    );
  }, [town, category, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Business Directory</h1>
        <p className="text-muted-foreground">
          Small businesses, shops and services across the Garden Route
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by town:</label>
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All towns</option>
            {TOWNS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All categories</option>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-3 w-5 h-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {businesses.length} business{businesses.length === 1 ? '' : 'es'}
      </h2>

      {businesses.length === 0 ? (
        <p className="text-muted-foreground">
          {BUSINESSES.length === 0
            ? 'No business data yet — run `node scripts/import-businesses.mjs` to populate this directory.'
            : 'No businesses match your search.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="p-4 rounded-lg border border-border hover:border-primary card-lift bg-background"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Store className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{business.name}</h3>
                  <p className="text-sm text-muted-foreground">{business.category}</p>
                </div>
              </div>
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {business.phone}
                </a>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={getBusinessMapsUrl(business)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-accent hover:bg-accent hover:text-accent-foreground transition"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Maps
                </a>
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <Globe className="w-4 h-4" aria-hidden="true" />
                    Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
