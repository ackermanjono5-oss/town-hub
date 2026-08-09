'use client';

import { useMemo, useState } from 'react';
import { MapPin, Star, Phone, Globe, Search, Siren } from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import {
  MEDICAL_FACILITIES,
  getMedicalByTown,
  getGoogleMapsUrl,
  type MedicalCategory,
  type MedicalFacility,
} from '@/lib/garden-route/medical';

const CATEGORIES: MedicalCategory[] = [
  'Hospital',
  'Doctor',
  'Dentist',
  'Chemist',
  'Optometrist',
];

function getGoogleReviewsUrl(facility: MedicalFacility, townLabel: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${facility.name} ${townLabel} reviews`)}`;
}

export default function MedicalPage() {
  const [town, setTown] = useState(TOWNS[0].slug);
  const [category, setCategory] = useState<'All' | MedicalCategory>('All');
  const [search, setSearch] = useState('');

  const townLabel = getTownLabel(town);

  const facilities = useMemo(() => {
    let inTown = getMedicalByTown(town);
    if (category !== 'All') {
      inTown = inTown.filter((m) => m.category === category);
    }
    const query = search.trim().toLowerCase();
    if (!query) return inTown;
    return inTown.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
    );
  }, [town, category, search]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Medical Directory</h1>
        <p className="text-muted-foreground">
          Find doctors, hospitals, chemists, dentists and optometrists across the
          Garden Route
        </p>
      </div>

      <a
        href="/sos"
        className="mb-8 flex items-center gap-3 p-4 rounded-lg bg-danger text-danger-foreground hover:opacity-90 transition"
      >
        <Siren className="w-8 h-8 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="font-bold">Medical Emergency?</p>
          <p className="text-sm opacity-90">Tap here for Emergency SOS — quick access to ambulance, hospitals and emergency contacts.</p>
        </div>
      </a>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Select Town:</label>
          <select
            value={town}
            onChange={(e) => setTown(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
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
            onChange={(e) => setCategory(e.target.value as 'All' | MedicalCategory)}
            className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
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
            placeholder="Search doctors, hospitals, chemists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Medical facilities in {townLabel} ({facilities.length})
        </h2>

        {facilities.length === 0 ? (
          <p className="text-muted-foreground">
            {MEDICAL_FACILITIES.length === 0
              ? 'No medical data yet — run `node scripts/import-medical.mjs` to populate this directory.'
              : 'No medical facilities match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="p-4 rounded-lg border border-border hover:border-primary card-lift bg-background"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{facility.name}</h3>
                  <p className="text-sm text-muted-foreground">{facility.category}</p>
                </div>
                {facility.phone && (
                  <a
                    href={`tel:${facility.phone}`}
                    className="mt-3 flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    {facility.phone}
                  </a>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={getGoogleMapsUrl(facility)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-accent hover:bg-accent hover:text-accent-foreground transition"
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    Maps
                  </a>
                  <a
                    href={getGoogleReviewsUrl(facility, townLabel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-border text-amber-600 hover:bg-amber-500 hover:text-white transition"
                  >
                    <Star className="w-4 h-4" aria-hidden="true" />
                    Google reviews
                  </a>
                  {facility.website && (
                    <a
                      href={facility.website}
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
    </div>
  );
}
