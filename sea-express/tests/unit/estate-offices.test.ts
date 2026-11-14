import { describe, expect, it } from 'vitest';
import {
  ESTATE_OFFICES,
  countOfficesByTown,
  getNearestOfficeTowns,
  getOfficeBrand,
  getOfficeMapsUrl,
  getOfficeWebsite,
} from '@/lib/garden-route/estate-offices';
import { ESTATE_AGENCIES } from '@/lib/garden-route/estate-agencies';
import { TOWNS } from '@/lib/garden-route/towns';

describe('estate agency offices', () => {
  it('have unique ids, real towns and known brands', () => {
    expect(new Set(ESTATE_OFFICES.map((o) => o.id)).size).toBe(ESTATE_OFFICES.length);
    const slugs = TOWNS.map((t) => t.slug);
    const brands = ESTATE_AGENCIES.map((a) => a.id);
    for (const o of ESTATE_OFFICES) {
      expect(slugs, o.id).toContain(o.town);
      if (o.agency) expect(brands, o.id).toContain(o.agency);
    }
  });

  it('link every website-checked office to the page it was checked on', () => {
    for (const o of ESTATE_OFFICES.filter((x) => x.verified)) {
      expect(o.website, o.id).toMatch(/^https:\/\//);
    }
  });

  it('have dialable South African numbers', () => {
    for (const o of ESTATE_OFFICES) {
      if (o.phone) expect(o.phone.replace(/\s/g, ''), o.id).toMatch(/^0\d{9}$/);
    }
  });

  it('sit within reach of their town', () => {
    for (const o of ESTATE_OFFICES) {
      if (o.lat == null || o.lng == null) continue;
      const t = TOWNS.find((x) => x.slug === o.town)!;
      const km = Math.hypot(o.lat - t.lat, (o.lng - t.lng) * Math.cos((t.lat * Math.PI) / 180)) * 111;
      // Dana Bay is listed under Mossel Bay, about 10 km from its centre.
      expect(km, o.id).toBeLessThan(12);
    }
  });

  it('fall back to the brand site and to Independent', () => {
    const seeffKnysna = ESTATE_OFFICES.find((o) => o.id === 'osm-11452257867')!;
    expect(getOfficeWebsite(seeffKnysna)).toBe('https://www.seeff.com');
    expect(getOfficeBrand(seeffKnysna)).toBe('Seeff Property Group');
    expect(getOfficeBrand(ESTATE_OFFICES.find((o) => o.id === 'osm-2233742484')!)).toBe('Independent');
  });

  it('navigate by coordinates when known, else by name and address', () => {
    const remax = ESTATE_OFFICES.find((o) => o.id === 'remax-coastal-knysna')!;
    expect(getOfficeMapsUrl(remax, 'Knysna')).toContain('-34.040207,23.054125');
    const fc = ESTATE_OFFICES.find((o) => o.id === 'fine-and-country-george')!;
    expect(getOfficeMapsUrl(fc, 'George')).toContain(encodeURIComponent('3 Courtenay Street'));
  });

  it('suggest nearby towns for a town without agencies', () => {
    const counts = countOfficesByTown();
    expect(counts.get('witsand') ?? 0).toBe(0);
    const near = getNearestOfficeTowns('witsand');
    expect(near.length).toBeGreaterThan(0);
    for (const n of near) expect(counts.get(n.slug)).toBeGreaterThan(0);
  });
});
