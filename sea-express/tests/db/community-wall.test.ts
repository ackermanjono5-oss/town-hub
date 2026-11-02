import { beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type TestUser } from './harness';

let env: Awaited<ReturnType<typeof createDatabase>>;
let alice: TestUser;
let bob: TestUser;
let carol: TestUser;
let dave: TestUser;
let admin: TestUser;

type Row = Record<string, unknown>;

async function post(user: TestUser, body: string, extra: Row = {}) {
  const res = await env.as(user, (q) =>
    q<Row>(
      `insert into public.wall_posts (category, town, body, contact, author_id, report_count, is_hidden)
       values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [
        extra.category ?? 'lost_found',
        extra.town ?? 'george',
        body,
        extra.contact ?? null,
        extra.author_id ?? user.id,
        extra.report_count ?? 0,
        extra.is_hidden ?? false,
      ]
    )
  );
  return res.rows[0];
}

async function visibleIds(user: TestUser | null) {
  const res = await env.as(user, (q) => q<{ id: string }>(`select id from public.wall_posts`));
  return res.rows.map((r) => r.id);
}

async function report(user: TestUser, postId: unknown) {
  return env.as(user, (q) => q(`insert into public.wall_reports (post_id, reason) values ($1, 'test')`, [postId]));
}

beforeAll(async () => {
  env = await createDatabase();
  alice = await env.createUser('Alice');
  bob = await env.createUser('Bob');
  carol = await env.createUser('Carol');
  dave = await env.createUser('Dave');
  admin = await env.createUser('Admin', 'admin');
});

describe('migrations', () => {
  it('all apply cleanly, including 0013_community_wall', () => {
    expect(env.files).toContain('0013_community_wall.sql');
  });
});

describe('posting', () => {
  it('lets a signed-in member post, filling in their name from their profile', async () => {
    const row = await post(alice, '  Lost tabby cat near Victoria Bay  ');
    expect(row.author_id).toBe(alice.id);
    expect(row.author_name).toBe('Alice');
    expect(row.body).toBe('Lost tabby cat near Victoria Bay');
  });

  it("can't be used to post as someone else or pre-hide/report a post", async () => {
    const row = await post(bob, 'Car broken down on the N2 at Kaaimans', {
      author_id: alice.id,
      report_count: 99,
      is_hidden: true,
    });
    expect(row.author_id).toBe(bob.id);
    expect(row.author_name).toBe('Bob');
    expect(row.report_count).toBe(0);
    expect(row.is_hidden).toBe(false);
  });

  it('stops anonymous visitors from posting', async () => {
    await expect(
      env.as(null, (q) => q(`insert into public.wall_posts (category, body) values ('notice', 'Hello everyone out there')`))
    ).rejects.toThrow();
  });

  it('rejects posts that are too short or in an unknown category', async () => {
    await expect(post(alice, 'short')).rejects.toThrow();
    await expect(post(alice, 'A perfectly long enough post', { category: 'spam' })).rejects.toThrow();
  });

  it('allows 5 posts a day per member, then says no', async () => {
    for (let i = 0; i < 5; i++) await post(dave, `Community notice number ${i + 1} for testing`);
    await expect(post(dave, 'Community notice number six for testing')).rejects.toThrow(/5 times a day/);
  });
});

describe('reading', () => {
  it('shows visible posts to everyone, signed in or not', async () => {
    const anonIds = await visibleIds(null);
    expect(anonIds.length).toBeGreaterThan(0);
    expect(await visibleIds(carol)).toEqual(expect.arrayContaining(anonIds));
  });
});

describe('reporting and moderation', () => {
  let target: Row;

  beforeAll(async () => {
    target = await post(alice, 'Suspicious post that neighbours will report');
  });

  it("doesn't let members report their own post", async () => {
    await expect(report(alice, target.id)).rejects.toThrow();
  });

  it('counts one report per member', async () => {
    await report(bob, target.id);
    await expect(report(bob, target.id)).rejects.toThrow(/duplicate key|unique/i);
  });

  it('hides a post after its third report', async () => {
    await report(carol, target.id);
    expect(await visibleIds(null)).toContain(target.id);
    await report(dave, target.id);

    expect(await visibleIds(null)).not.toContain(target.id);
    expect(await visibleIds(bob)).not.toContain(target.id);
    // The author and admins still see it.
    expect(await visibleIds(alice)).toContain(target.id);
    expect(await visibleIds(admin)).toContain(target.id);

    const res = await env.db.query<Row>(`select report_count, is_hidden from public.wall_posts where id = $1`, [target.id]);
    expect(res.rows[0]).toEqual({ report_count: 3, is_hidden: true });
  });

  it('lets only admins see the reasons', async () => {
    const asCarol = await env.as(carol, (q) => q(`select * from public.wall_reports where post_id = $1`, [target.id]));
    expect(asCarol.rows).toHaveLength(1); // her own report only
    const asAdmin = await env.as(admin, (q) => q(`select * from public.wall_reports where post_id = $1`, [target.id]));
    expect(asAdmin.rows).toHaveLength(3);
  });

  it("doesn't let members restore or edit posts", async () => {
    const res = await env.as(alice, (q) =>
      q(`update public.wall_posts set is_hidden = false, body = 'edited body text here' where id = $1`, [target.id])
    );
    expect(res.affectedRows ?? 0).toBe(0);
  });

  it('lets an admin restore a post', async () => {
    await env.as(admin, (q) => q(`update public.wall_posts set is_hidden = false where id = $1`, [target.id]));
    expect(await visibleIds(null)).toContain(target.id);
  });
});

describe('deleting', () => {
  it("lets authors delete their own posts but not other people's", async () => {
    const mine = await post(carol, 'Found a set of keys at the Wilderness beach');
    const notMine = await env.as(bob, (q) => q(`delete from public.wall_posts where id = $1`, [mine.id]));
    expect(notMine.affectedRows ?? 0).toBe(0);
    expect(await visibleIds(null)).toContain(mine.id);

    const own = await env.as(carol, (q) => q(`delete from public.wall_posts where id = $1`, [mine.id]));
    expect(own.affectedRows).toBe(1);
    expect(await visibleIds(null)).not.toContain(mine.id);
  });

  it('lets an admin delete any post', async () => {
    const p = await post(bob, 'A post the admin will remove from the wall');
    const res = await env.as(admin, (q) => q(`delete from public.wall_posts where id = $1`, [p.id]));
    expect(res.affectedRows).toBe(1);
  });
});
