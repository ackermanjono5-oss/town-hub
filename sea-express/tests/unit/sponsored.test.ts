import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FRONT_PAGE_ADS,
  SPONSORED_LISTINGS,
  TOWN_BANNERS,
  actionHref,
  bannersForTown,
  internationalDigits,
  listingsForTown,
} from '@/lib/garden-route/sponsored';
import { TOWNS } from '@/lib/garden-route/towns';

const PUBLIC = join(__dirname, '..', '..', 'public');

describe('links', () => {
  it('turns local numbers into international ones', () => {
    expect(internationalDigits('073 169 0523')).toBe('27731690523');
    expect(internationalDigits('+27 73 169 0523')).toBe('27731690523');
  });

  it('builds WhatsApp, call, email and directions links', () => {
    expect(actionHref({ kind: 'whatsapp', phone: '073 169 0523' })).toBe('https://wa.me/27731690523');
    expect(actionHref({ kind: 'call', phone: '044 535 9760' })).toBe('tel:+27445359760');
    expect(actionHref({ kind: 'email', address: 'info@seaexpress.co.za' })).toBe('mailto:info@seaexpress.co.za');
    expect(actionHref({ kind: 'directions', query: '36 Monument Street, Wittedrift' })).toContain(
      '36%20Monument%20Street'
    );
  });
});

describe("what the advertisers asked for", () => {
  it('shows the MossiNet banner only in Plettenberg Bay and Knysna, with WhatsApp only', () => {
    const mossinet = TOWN_BANNERS.find((b) => b.id === 'mossinet')!;
    expect(mossinet.towns.sort()).toEqual(['knysna', 'plett']);
    expect(mossinet.actions).toEqual([{ kind: 'whatsapp', phone: '073 169 0523' }]);
    expect(bannersForTown('george').map((b) => b.id)).not.toContain('mossinet');
  });

  it('puts the Wittedrift banner and listing in Wittedrift, linked to their Facebook page', () => {
    expect(bannersForTown('wittedrift').map((b) => b.id)).toEqual(['wittedrift-butchery']);
    const listing = listingsForTown('wittedrift')[0];
    expect(listing.actions).toContainEqual({ kind: 'facebook', url: 'https://www.facebook.com/share/1CFnZrAaqW/' });
  });

  it('lists Sea Express under Plettenberg Bay with its link and emails, and no phone numbers', () => {
    const sea = listingsForTown('plett').find((l) => l.id === 'sea-express')!;
    const kinds = sea.actions.map((a) => a.kind);
    expect(kinds).not.toContain('call');
    expect(kinds).not.toContain('whatsapp');
    expect(sea.actions).toContainEqual({ kind: 'facebook', url: 'https://www.facebook.com/share/1FWMc4tcjf/' });
    const emails = sea.actions.flatMap((a) => (a.kind === 'email' ? [a.address] : []));
    expect(emails.sort()).toEqual(['info@seaexpress.co.za', 'plettnews@seaexpress.co.za']);
    const poster = FRONT_PAGE_ADS.find((a) => a.id === 'sea-express')!;
    expect(poster.actions.map((a) => a.kind)).not.toContain('call');
  });

  it('puts MossiScreen and Sea Express on the front page', () => {
    expect(FRONT_PAGE_ADS.map((a) => a.id)).toEqual(['mossiscreen', 'sea-express']);
  });
});

describe('placements', () => {
  it('only use real towns', () => {
    const slugs = TOWNS.map((t) => t.slug);
    for (const b of TOWN_BANNERS) for (const t of b.towns) expect(slugs, b.id).toContain(t);
    for (const l of SPONSORED_LISTINGS) expect(slugs, l.id).toContain(l.town);
  });

  it('have every image in public/', () => {
    const images = [
      ...FRONT_PAGE_ADS.map((a) => a.image),
      ...TOWN_BANNERS.map((b) => b.image),
      ...SPONSORED_LISTINGS.map((l) => l.logo),
    ];
    for (const src of images) expect(existsSync(join(PUBLIC, src)), src).toBe(true);
  });
});
