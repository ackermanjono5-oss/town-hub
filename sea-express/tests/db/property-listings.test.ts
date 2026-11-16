import { beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type TestUser } from './harness';

let env: Awaited<ReturnType<typeof createDatabase>>;
let agent: TestUser;
let pendingAgent: TestUser;
let stranger: TestUser;
let admin: TestUser;
let agencyId: string;
let pendingAgencyId: string;

type Row = Record<string, unknown>;

const LISTING = {
  listing_type: 'sale',
  property_type: 'house',
  title: 'Family home near the beach',
  price: 2450000,
  bedrooms: 3,
  bathrooms: 2,
  town: 'plett',
};

async function insertListing(user: TestUser, businessId: string, extra: Row = {}) {
  const row = { ...LISTING, business_id: businessId, status: 'draft', ...extra };
  const cols = Object.keys(row);
  const res = await env.as(user, (q) =>
    q<Row>(
      `insert into public.property_listings (${cols.join(', ')}) values (${cols.map((_, i) => `$${i + 1}`).join(', ')}) returning *`,
      Object.values(row)
    )
  );
  return res.rows[0];
}

async function publicIds() {
  const res = await env.as(null, (q) => q<{ id: string }>(`select id from public.property_listings`));
  return res.rows.map((r) => r.id);
}

async function business(owner: TestUser, approval: string, advertiser: string) {
  const res = await env.db.query<{ id: string }>(
    `insert into public.businesses (owner_id, name, approval_status, advertiser_status, is_active)
     values ($1, $2, $3, $4, true) returning id`,
    [owner.id, `${owner.name} Properties`, approval, advertiser]
  );
  return res.rows[0].id;
}

beforeAll(async () => {
  env = await createDatabase();
  agent = await env.createUser('Agent');
  pendingAgent = await env.createUser('Pending Agent');
  stranger = await env.createUser('Stranger');
  admin = await env.createUser('Admin', 'admin');
  agencyId = await business(agent, 'approved', 'active');
  pendingAgencyId = await business(pendingAgent, 'pending', 'needs_verification');
});

describe('posting listings', () => {
  it('lets an approved agency add a draft listing', async () => {
    const row = await insertListing(agent, agencyId);
    expect(row.status).toBe('draft');
    expect(row.created_by).toBe(agent.id);
    expect(row.agency_name).toBe('Agent Properties');
  });

  it("doesn't let an agency publish its own listing", async () => {
    await expect(insertListing(agent, agencyId, { status: 'approved' })).rejects.toThrow(/approved by Town Hub/);
  });

  it("doesn't let an agency that isn't approved yet post", async () => {
    await expect(insertListing(pendingAgent, pendingAgencyId)).rejects.toThrow();
  });

  it("doesn't let anyone post for an agency they don't own", async () => {
    await expect(insertListing(stranger, agencyId)).rejects.toThrow();
  });

  it('rejects listings that break the basic rules', async () => {
    await expect(insertListing(agent, agencyId, { price: -1 })).rejects.toThrow();
    await expect(insertListing(agent, agencyId, { listing_type: 'swap' })).rejects.toThrow();
    await expect(insertListing(agent, agencyId, { photos: ['1', '2', '3', '4', '5', '6', '7'] })).rejects.toThrow();
    await expect(insertListing(agent, agencyId, { agency_url: 'javascript:alert(1)' })).rejects.toThrow();
  });
});

describe('review and going live', () => {
  let listing: Row;

  beforeAll(async () => {
    listing = await insertListing(agent, agencyId, { status: 'submitted', title: 'Sea-view apartment' });
  });

  it('records when a listing was submitted and keeps it off the public page', async () => {
    expect(listing.submitted_at).not.toBeNull();
    expect(await publicIds()).not.toContain(listing.id);
  });

  it("doesn't let the agency approve it or write the review note", async () => {
    await expect(
      env.as(agent, (q) => q(`update public.property_listings set status = 'approved' where id = $1`, [listing.id]))
    ).rejects.toThrow(/approved by Town Hub/);
    await expect(
      env.as(agent, (q) => q(`update public.property_listings set review_note = 'ok' where id = $1`, [listing.id]))
    ).rejects.toThrow(/only Town Hub/);
  });

  it('goes live when an admin approves it', async () => {
    await env.as(admin, (q) =>
      q(`update public.property_listings set status = 'approved', reviewed_at = now() where id = $1`, [listing.id])
    );
    expect(await publicIds()).toContain(listing.id);
  });

  it('can be marked sold without going back for review', async () => {
    await env.as(agent, (q) => q(`update public.property_listings set is_sold = true where id = $1`, [listing.id]));
    const res = await env.db.query<Row>(`select status, is_sold from public.property_listings where id = $1`, [listing.id]);
    expect(res.rows[0]).toEqual({ status: 'approved', is_sold: true });
  });

  it('goes back for review when its details change', async () => {
    await env.as(agent, (q) => q(`update public.property_listings set price = 1999000 where id = $1`, [listing.id]));
    const res = await env.db.query<Row>(`select status from public.property_listings where id = $1`, [listing.id]);
    expect(res.rows[0].status).toBe('submitted');
    expect(await publicIds()).not.toContain(listing.id);
  });

  it("doesn't let strangers change or delete it", async () => {
    const upd = await env.as(stranger, (q) => q(`update public.property_listings set title = 'Hacked title' where id = $1`, [listing.id]));
    expect(upd.affectedRows ?? 0).toBe(0);
    const del = await env.as(stranger, (q) => q(`delete from public.property_listings where id = $1`, [listing.id]));
    expect(del.affectedRows ?? 0).toBe(0);
  });

  it('disappears from the public page when the agency is suspended', async () => {
    await env.as(admin, (q) => q(`update public.property_listings set status = 'approved' where id = $1`, [listing.id]));
    expect(await publicIds()).toContain(listing.id);
    await env.db.query(`update public.businesses set approval_status = 'suspended' where id = $1`, [agencyId]);
    expect(await publicIds()).not.toContain(listing.id);
    await env.db.query(`update public.businesses set approval_status = 'approved' where id = $1`, [agencyId]);
  });

  it('lets the agency delete its own listing', async () => {
    const res = await env.as(agent, (q) => q(`delete from public.property_listings where id = $1`, [listing.id]));
    expect(res.affectedRows).toBe(1);
  });
});
