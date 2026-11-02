import { describe, expect, it, vi } from 'vitest';
import {
  CACHE_MAX_AGE_MS,
  describeAge,
  fetchForecast,
  parseForecast,
  readCachedForecast,
  saveForecast,
} from '@/lib/weather';

const WEATHER = {
  current: {
    temperature_2m: 21.4,
    apparent_temperature: 20.1,
    relative_humidity_2m: 70,
    is_day: 1,
    weather_code: 2,
    wind_speed_10m: 14,
    wind_direction_10m: 135,
  },
  daily: {
    time: ['2026-11-02', '2026-11-03'],
    weather_code: [2, 61],
    temperature_2m_max: [24, 19],
    temperature_2m_min: [14, 12],
    precipitation_probability_max: [10, 80],
    uv_index_max: [8.5, 4],
  },
};
const MARINE = { current: { wave_height: 1.8, sea_surface_temperature: 18.2 } };

function memoryStore() {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
}

function response(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}

const isMarine = (url: unknown) => String(url).includes('marine');

describe('parseForecast', () => {
  it('maps Open-Meteo fields', () => {
    const f = parseForecast(WEATHER, MARINE);
    expect(f.current).toMatchObject({ temperature: 21.4, isDay: true, code: 2, windDirection: 135 });
    expect(f.days).toHaveLength(2);
    expect(f.days[1]).toEqual({ date: '2026-11-03', code: 61, max: 19, min: 12, rain: 80, uv: 4 });
    expect(f.sea).toEqual({ waveHeight: 1.8, temperature: 18.2 });
  });

  it('leaves out the sea inland, where marine values are null', () => {
    expect(parseForecast(WEATHER, { current: { wave_height: null, sea_surface_temperature: null } }).sea).toBeNull();
    expect(parseForecast(WEATHER, null).sea).toBeNull();
  });

  it('throws on an error body such as "service overloaded"', () => {
    expect(() => parseForecast({ error: true, reason: 'The service is overloaded' }, null)).toThrow();
  });
});

describe('fetchForecast', () => {
  it('retries once when the service is busy', async () => {
    let weatherCalls = 0;
    const fetchImpl = vi.fn(async (url: string) => {
      if (isMarine(url)) return response(200, MARINE);
      weatherCalls += 1;
      return weatherCalls === 1 ? response(503, { error: true }) : response(200, WEATHER);
    });
    const f = await fetchForecast(-33.96, 22.46, fetchImpl as unknown as typeof fetch, 0);
    expect(f.current.temperature).toBe(21.4);
    expect(weatherCalls).toBe(2);
  });

  it('gives up after the second failure', async () => {
    const fetchImpl = vi.fn(async () => response(503, { error: true }));
    await expect(fetchForecast(0, 0, fetchImpl as unknown as typeof fetch, 0)).rejects.toThrow(/503/);
  });

  it('still returns the forecast when the marine API fails', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (isMarine(url)) throw new Error('offline');
      return response(200, WEATHER);
    });
    const f = await fetchForecast(0, 0, fetchImpl as unknown as typeof fetch, 0);
    expect(f.sea).toBeNull();
  });
});

describe('forecast cache', () => {
  it('round-trips a forecast per town', () => {
    const store = memoryStore();
    const f = parseForecast(WEATHER, MARINE);
    saveForecast('george', f, 1000, store);
    expect(readCachedForecast('george', 2000, store)).toEqual({ forecast: f, savedAt: 1000 });
    expect(readCachedForecast('knysna', 2000, store)).toBeNull();
  });

  it('ignores forecasts that are too old or corrupt', () => {
    const store = memoryStore();
    saveForecast('george', parseForecast(WEATHER, null), 0, store);
    expect(readCachedForecast('george', CACHE_MAX_AGE_MS + 1, store)).toBeNull();
    store.setItem('townhub:forecast:knysna', '{not json');
    expect(readCachedForecast('knysna', 0, store)).toBeNull();
  });

  it('copes with no storage at all', () => {
    expect(() => saveForecast('george', parseForecast(WEATHER, null), 0, null)).not.toThrow();
    expect(readCachedForecast('george', 0, null)).toBeNull();
  });
});

describe('describeAge', () => {
  it('reads naturally', () => {
    const now = 10 * 24 * 3600_000;
    expect(describeAge(now - 20_000, now)).toBe('just now');
    expect(describeAge(now - 60_000, now)).toBe('1 minute ago');
    expect(describeAge(now - 45 * 60_000, now)).toBe('45 minutes ago');
    expect(describeAge(now - 3 * 3600_000, now)).toBe('3 hours ago');
    expect(describeAge(now - 24 * 3600_000, now)).toBe('yesterday');
    expect(describeAge(now - 3 * 24 * 3600_000, now)).toBe('3 days ago');
  });
});
