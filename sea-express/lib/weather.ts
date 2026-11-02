/**
 * Forecasts from Open-Meteo (free, no key, CC BY 4.0). Coastal towns also
 * get wave height and sea temperature from Open-Meteo's marine API, which
 * returns nulls inland.
 *
 * The last good forecast for each town is kept in localStorage, so the
 * page still has something to show when the phone is offline or Open-Meteo
 * is overloaded (it answers 503 "The service is overloaded" at busy times).
 */

export interface Forecast {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    isDay: boolean;
    code: number;
    windSpeed: number;
    windDirection: number;
  };
  days: { date: string; code: number; max: number; min: number; rain: number | null; uv: number | null }[];
  sea: { waveHeight: number | null; temperature: number | null } | null;
}

export interface CachedForecast {
  forecast: Forecast;
  /** When it was fetched, in ms since the epoch. */
  savedAt: number;
}

const CACHE_PREFIX = 'townhub:forecast:';
/** Older than this, a saved forecast is too stale to be worth showing. */
export const CACHE_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

export function weatherUrl(lat: number, lng: number): string {
  return (
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max' +
    '&timezone=Africa%2FJohannesburg&forecast_days=5'
  );
}

export function marineUrl(lat: number, lng: number): string {
  return (
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
    '&current=wave_height,sea_surface_temperature&timezone=Africa%2FJohannesburg'
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- raw Open-Meteo JSON */
/** Turns Open-Meteo's forecast (and optional marine) JSON into a Forecast. */
export function parseForecast(w: any, marine: any): Forecast {
  if (!w?.current || !Array.isArray(w?.daily?.time)) throw new Error('Unexpected weather response');
  const sea =
    marine?.current && (marine.current.wave_height != null || marine.current.sea_surface_temperature != null)
      ? { waveHeight: marine.current.wave_height ?? null, temperature: marine.current.sea_surface_temperature ?? null }
      : null;

  return {
    current: {
      temperature: w.current.temperature_2m,
      feelsLike: w.current.apparent_temperature,
      humidity: w.current.relative_humidity_2m,
      isDay: w.current.is_day === 1,
      code: w.current.weather_code,
      windSpeed: w.current.wind_speed_10m,
      windDirection: w.current.wind_direction_10m,
    },
    days: (w.daily.time as string[]).map((date, i) => ({
      date,
      code: w.daily.weather_code[i],
      max: w.daily.temperature_2m_max[i],
      min: w.daily.temperature_2m_min[i],
      rain: w.daily.precipitation_probability_max?.[i] ?? null,
      uv: w.daily.uv_index_max?.[i] ?? null,
    })),
    sea,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Fetches a forecast, trying the weather API a second time after a short
 * pause when it's busy or the request fails. Sea data is a bonus: if it
 * fails, the forecast still comes back.
 */
export async function fetchForecast(
  lat: number,
  lng: number,
  fetchImpl: typeof fetch = fetch,
  retryDelayMs = 1500
): Promise<Forecast> {
  const marine = fetchImpl(marineUrl(lat, lng))
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((ok) => setTimeout(ok, retryDelayMs));
    try {
      const res = await fetchImpl(weatherUrl(lat, lng));
      if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
      return parseForecast(await res.json(), await marine);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStore(): Store | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function saveForecast(town: string, forecast: Forecast, now = Date.now(), store = defaultStore()): void {
  try {
    store?.setItem(CACHE_PREFIX + town, JSON.stringify({ forecast, savedAt: now } satisfies CachedForecast));
  } catch {
    /* storage full or unavailable — the cache is only a fallback */
  }
}

/** The saved forecast for a town, or null if there is none or it's too old. */
export function readCachedForecast(town: string, now = Date.now(), store = defaultStore()): CachedForecast | null {
  try {
    const raw = store?.getItem(CACHE_PREFIX + town);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedForecast;
    if (!cached?.forecast?.current || typeof cached.savedAt !== 'number') return null;
    if (now - cached.savedAt > CACHE_MAX_AGE_MS) return null;
    return cached;
  } catch {
    return null;
  }
}

/** "5 minutes ago", "3 hours ago", "yesterday", "2 days ago". */
export function describeAge(savedAt: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - savedAt) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
