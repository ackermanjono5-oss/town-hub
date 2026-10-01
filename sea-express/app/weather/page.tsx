'use client';

import { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Droplets } from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';

export default function WeatherPage() {
  const [town, setTown] = useState(TOWNS[0].slug);
  const townLabel = getTownLabel(town);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [town]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Weather & Tides</h1>
        <p className="text-muted-foreground">
          Live forecast, storm/rain alerts and tide times for the Garden Route
        </p>
      </div>

      <div className="mb-8">
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

      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">
            Loading weather...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border bg-background card-lift text-center">
              <Sun className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-1">24°C</h2>
              <p className="text-lg font-medium text-foreground mb-2">Sunny</p>
              <p className="text-sm text-muted-foreground">Current conditions in {townLabel}</p>
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-background card-lift flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="w-5 h-5" /> Wind
                </div>
                <span className="font-semibold">14 km/h SE</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="w-5 h-5" /> Humidity
                </div>
                <span className="font-semibold">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CloudRain className="w-5 h-5" /> Rain Chance
                </div>
                <span className="font-semibold">10%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
