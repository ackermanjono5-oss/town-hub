'use client';

import { useMemo, useState } from 'react';
import { MapPin, Phone, Globe, Search, BedDouble } from 'lucide-react';
import { TOWNS } from '@/lib/garden-route/towns';
import {
  ACCOMMODATION,
  ACCOMMODATION_CATEGORIES,
  getAccommodationByTown,
  getAccommodationMapsUrl,
} from '@/lib/garden-route/accommodation';

export default function AccommodationPage() {
  const [town, setTown] = useState<string>('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const stays = useMemo(() => {
    let inTown = town === 'all' ? ACCOMMODATION : getAccommodationByTown(town);
    if (category !== 'all') {
      inTown = inTown.filter((s) => s.category === category);
    }
    const query = search.trim().toLowerCase();
    if (!query) return inTown;
    return inTown.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    );
  }, [town, category, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hotels &amp; B&amp;Bs</h1>
        <p className="text-muted-foreground">
          Hotels, guest houses and B&amp;Bs across the Garden Route
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
            {ACCOMMODATION_CATEGORIES.map((c) => (
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
            placeholder="Search hotels, guest houses, B&Bs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        {stays.length} place{stays.length === 1 ? '' : 's'} to stay
      </h2>

      {stays.length === 0 ? (
        <p className="text-muted-foreground">
          {ACCOMMODATION.length === 0
            ? 'No accommodation data yet — run `node scripts/import-accommodation.mjs` to populate this directory.'
            : 'No places match your search.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stays.map((stay) => (
            <div
              key={stay.id}
              className="p-4 rounded-lg border border-border hover:border-primary card-lift bg-background"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <BedDouble className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{stay.name}</h3>
                  <p className="text-sm text-muted-foreground">{stay.category}</p>
                </div>
              </div>
              {stay.phone && (
                <a
                  href={`tel:${stay.phone}`}
                  className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {stay.phone}
                </a>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={getAccommodationMapsUrl(stay)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-accent hover:bg-accent hover:text-accent-foreground transition"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  Maps
                </a>
                {stay.website && (
                  <a
                    href={stay.website}
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
