'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Moon,
  RefreshCw,
  Sun,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import { describeAge, fetchForecast, readCachedForecast, saveForecast, type Forecast } from '@/lib/weather';
import PageHero from '@/components/PageHero';
import TownPills from '@/components/TownPills';
import { CloudSun as HeroIcon } from 'lucide-react';

/**
 * Live weather for each town, by the town's coordinates in
 * lib/garden-route/towns.ts. Fetching, parsing and the offline cache live
 * in lib/weather.ts.
 */

const TOWN_KEY = 'townhub:weather-town';
const DEFAULT_TOWN = 'george';

/** WMO weather codes, as Open-Meteo reports them. */
function describe(code: number, isDay = true): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: isDay ? 'Clear and sunny' : 'Clear', icon: isDay ? Sun : Moon };
  if (code === 1) return { label: 'Mostly clear', icon: isDay ? Sun : Moon };
  if (code === 2) return { label: 'Partly cloudy', icon: isDay ? CloudSun : CloudMoon };
  if (code === 3) return { label: 'Overcast', icon: Cloud };
  if (code === 45 || code === 48) return { label: 'Fog', icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: CloudDrizzle };
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: 'Rain showers', icon: CloudRain };
  if (code === 85 || code === 86) return { label: 'Snow showers', icon: CloudSnow };
  if (code >= 95) return { label: 'Thunderstorms', icon: CloudLightning };
  return { label: 'Cloudy', icon: Cloud };
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
function compass(degrees: number) {
  return COMPASS[Math.round(degrees / 22.5) % 16];
}

function dayName(date: string, index: number) {
  if (index === 0) return 'Today';
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}

export default function WeatherPage() {
  const [town, setTown] = useState(DEFAULT_TOWN);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  // Set when the forecast on screen is a saved one because the live one
  // couldn't be fetched.
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const townLabel = getTownLabel(town);

  // Remembers the last town, so people see their own weather straight away.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(TOWN_KEY);
      if (saved && TOWNS.some((t) => t.slug === saved)) setTown(saved);
    } catch {
      /* storage unavailable (file:// or private mode) — keep the default */
    }
  }, []);

  const chooseTown = (slug: string) => {
    setTown(slug);
    try {
      window.localStorage.setItem(TOWN_KEY, slug);
    } catch {
      /* ignore */
    }
  };

  const load = useCallback(() => {
    const t = TOWNS.find((x) => x.slug === town);
    if (!t) return () => {};
    let cancelled = false;
    setStatus('loading');
    fetchForecast(t.lat, t.lng)
      .then((f) => {
        if (cancelled) return;
        saveForecast(town, f);
        setForecast(f);
        setSavedAt(null);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        const cached = readCachedForecast(town);
        if (cached) {
          setForecast(cached.forecast);
          setSavedAt(cached.savedAt);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [town]);

  useEffect(() => load(), [load]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHero
        title="Weather"
        subtitle="Live conditions, sea and a 5-day forecast for every town on the Garden Route."
        icon={HeroIcon}
        theme="ocean"
        className="mb-6"
      />

      <section className="mb-6 rounded-2xl border border-white/60 dark:border-white/10 bg-card/85 p-4 shadow-lg backdrop-blur sm:p-5">
        <TownPills towns={TOWNS} value={town} onChange={chooseTown} />
      </section>

      {status === 'loading' && <WeatherSkeleton />}

      {status === 'error' && (
        <div className="rounded-3xl bg-card/90 p-8 text-center shadow-lg">
          <WifiOff className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Couldn&apos;t load the weather</h2>
          <p className="mt-1 text-sm text-slate-600">
            You may be offline, or the weather service is busy. Please try again in a minute.
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && forecast && savedAt !== null && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-100 dark:bg-amber-400/15 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span className="inline-flex items-center gap-2">
            <WifiOff className="h-4 w-4 flex-none" aria-hidden="true" />
            Couldn&apos;t update. Showing the forecast from {describeAge(savedAt)}.
          </span>
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && forecast && <ForecastView forecast={forecast} townLabel={townLabel} />}

      <p className="mt-6 text-center text-xs text-slate-500">
        Weather data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">
          Open-Meteo.com
        </a>
        , updated every 15 minutes.
      </p>
    </div>
  );
}

function ForecastView({ forecast, townLabel }: { forecast: Forecast; townLabel: string }) {
  const { current, days, sea } = forecast;
  const now = describe(current.code, current.isDay);
  const NowIcon = now.icon;
  const today = days[0];

  return (
    <div className="space-y-5 rise-in">
      {/* Now */}
      <section
        className={[
          'relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_48px_-24px_rgba(10,47,92,0.8)]',
          current.isDay
            ? 'bg-gradient-to-br from-[#0a5c9c] via-[#1c8ec4] to-[#5fc8e8]'
            : 'bg-gradient-to-br from-[#0b1026] via-[#1e2a5a] to-[#2b4a8a]',
        ].join(' ')}
      >
        <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Now in {townLabel}</p>
            <p className="mt-2 text-6xl font-extrabold tracking-tight">{Math.round(current.temperature)}°</p>
            <p className="mt-1 text-lg font-semibold">{now.label}</p>
            <p className="text-sm text-white/80">Feels like {Math.round(current.feelsLike)}°</p>
          </div>
          <NowIcon className="h-24 w-24 flex-none text-white drop-shadow-lg" strokeWidth={1.4} aria-hidden="true" />
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat icon={Wind} label="Wind" value={`${Math.round(current.windSpeed)} km/h ${compass(current.windDirection)}`} />
          <Stat icon={Droplets} label="Humidity" value={`${current.humidity}%`} />
          <Stat icon={Umbrella} label="Rain today" value={today?.rain != null ? `${today.rain}%` : '—'} />
          <Stat icon={Sun} label="UV today" value={today?.uv != null ? String(Math.round(today.uv)) : '—'} />
        </div>
      </section>

      {/* Sea, for coastal towns */}
      {sea && (
        <section className="flex items-center gap-4 rounded-3xl bg-card/90 p-5 shadow-lg">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-cyan-100 dark:bg-cyan-400/15 text-cyan-700 dark:text-cyan-300">
            <Waves className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Waves</p>
              <p className="text-xl font-bold text-slate-900">
                {sea.waveHeight != null ? `${sea.waveHeight.toFixed(1)} m` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sea temperature</p>
              <p className="flex items-center gap-1 text-xl font-bold text-slate-900">
                <Thermometer className="h-4 w-4 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
                {sea.temperature != null ? `${Math.round(sea.temperature)}°C` : '—'}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 5-day */}
      <section className="rounded-3xl bg-card/90 p-5 shadow-lg">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-secondary-foreground">5-day forecast</h2>
        <ul className="divide-y divide-slate-100">
          {days.map((d, i) => {
            const { label, icon: Icon } = describe(d.code);
            return (
              <li key={d.date} className="flex items-center gap-3 py-2.5">
                <span className="w-12 text-sm font-semibold text-slate-800">{dayName(d.date, i)}</span>
                <Icon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{label}</span>
                {d.rain != null && d.rain > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                    <Droplets className="h-3 w-3" aria-hidden="true" />
                    {d.rain}%
                  </span>
                )}
                <span className="w-16 text-right text-sm">
                  <span className="font-bold text-slate-900">{Math.round(d.max)}°</span>{' '}
                  <span className="text-slate-500">{Math.round(d.min)}°</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-2.5 ring-1 ring-white/20 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/75">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-0.5 text-[15px] font-bold">{value}</p>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading the weather">
      <div className="h-[244px] animate-pulse rounded-3xl bg-white/60" />
      <div className="h-[220px] animate-pulse rounded-3xl bg-white/60" />
    </div>
  );
}
