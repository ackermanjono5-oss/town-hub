import { describe, expect, it } from 'vitest';
import { RADIO_STATIONS } from '@/lib/garden-route/radio';
import { TOWNS, getTownLabel } from '@/lib/garden-route/towns';
import { NATIONAL_CONTACTS, getEmergencyContactsByTown } from '@/lib/garden-route/emergency';
import { BUSINESS_REGISTRATIONS_EMAIL, MEMBER_REGISTRATIONS_EMAIL } from '@/lib/contact';

describe('radio stations', () => {
  it('have unique ids', () => {
    const ids = RADIO_STATIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only use streams the Android app can play (https)', () => {
    for (const s of RADIO_STATIONS) {
      if (s.stream) expect(s.stream, s.name).toMatch(/^https:\/\//);
      expect(s.website, s.name).toMatch(/^https:\/\//);
    }
  });
});

describe('towns', () => {
  it('have unique slugs and prefixes, with coordinates on the Garden Route', () => {
    expect(new Set(TOWNS.map((t) => t.slug)).size).toBe(TOWNS.length);
    expect(new Set(TOWNS.map((t) => t.prefix)).size).toBe(TOWNS.length);
    for (const t of TOWNS) {
      expect(t.lat).toBeGreaterThan(-35);
      expect(t.lat).toBeLessThan(-33);
      expect(t.lng).toBeGreaterThan(20);
      expect(t.lng).toBeLessThan(25);
    }
    expect(getTownLabel('plett')).toBe('Plettenberg Bay');
  });
});

describe('emergency numbers', () => {
  it('include 112 and the SAPS 10111 line', () => {
    const phones = NATIONAL_CONTACTS.map((c) => c.phone.replace(/\s/g, ''));
    expect(phones).toContain('112');
    expect(phones).toContain('10111');
  });

  it('only list town contacts for that town', () => {
    for (const t of TOWNS) {
      for (const c of getEmergencyContactsByTown(t.slug)) expect(c.town).toBe(t.slug);
    }
  });
});

describe('registration mailboxes', () => {
  it('are on the seaexpress.co.za domain', () => {
    expect(MEMBER_REGISTRATIONS_EMAIL).toBe('townhubregistrations@seaexpress.co.za');
    expect(BUSINESS_REGISTRATIONS_EMAIL).toBe('townhubregbusiness@seaexpress.co.za');
  });
});
