import { beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type TestUser } from './harness';

let env: Awaited<ReturnType<typeof createDatabase>>;
let alice: TestUser;
let bob: TestUser;
let admin: TestUser;

beforeAll(async () => {
  env = await createDatabase();
  alice = await env.createUser('Alice');
  bob = await env.createUser('Bob');
  admin = await env.createUser('Admin', 'admin');
});

describe('profiles', () => {
  it('are created on sign-up with the name from the sign-in provider', async () => {
    const res = await env.db.query<{ full_name: string; role: string }>(
      `select full_name, role from public.profiles where id = $1`,
      [alice.id]
    );
    expect(res.rows[0]).toEqual({ full_name: 'Alice', role: 'customer' });
  });

  it("are private: members see only their own, and visitors see none", async () => {
    const asAlice = await env.as(alice, (q) => q<{ id: string }>(`select id from public.profiles`));
    expect(asAlice.rows.map((r) => r.id)).toEqual([alice.id]);
    const asAnon = await env.as(null, (q) => q(`select id from public.profiles`));
    expect(asAnon.rows).toHaveLength(0);
  });

  it('let admins see everyone', async () => {
    const res = await env.as(admin, (q) => q(`select id from public.profiles`));
    expect(res.rows.length).toBeGreaterThanOrEqual(3);
  });

  it('let members change their name but not make themselves admin or subscribed', async () => {
    await env.as(alice, (q) => q(`update public.profiles set full_name = 'Alice B' where id = $1`, [alice.id]));
    await expect(
      env.as(alice, (q) => q(`update public.profiles set role = 'admin' where id = $1`, [alice.id]))
    ).rejects.toThrow(/permission denied/);
    await expect(
      env.as(alice, (q) => q(`update public.profiles set is_subscribed = true where id = $1`, [alice.id]))
    ).rejects.toThrow(/permission denied/);
    const res = await env.db.query<{ full_name: string; role: string }>(
      `select full_name, role from public.profiles where id = $1`,
      [alice.id]
    );
    expect(res.rows[0]).toEqual({ full_name: 'Alice B', role: 'customer' });
  });

  it("don't let members edit someone else's profile", async () => {
    const res = await env.as(bob, (q) => q(`update public.profiles set full_name = 'Hacked' where id = $1`, [alice.id]));
    expect(res.affectedRows ?? 0).toBe(0);
  });
});

describe('rewards functions', () => {
  const nil = '00000000-0000-0000-0000-000000000000';

  it('only let the server (service role) issue or redeem vouchers', async () => {
    for (const user of [null, alice]) {
      await expect(
        env.as(user, (q) => q(`select public.issue_voucher($1, $2)`, [nil, nil]))
      ).rejects.toThrow(/permission denied/);
      await expect(
        env.as(user, (q) => q(`select * from public.redeem_voucher($1, $2, $3, true)`, [nil, nil, nil]))
      ).rejects.toThrow(/permission denied/);
    }
  });

  it("don't let visitors use the admin membership tools", async () => {
    await expect(
      env.as(null, (q) => q(`select public.admin_set_membership($1, true)`, [alice.id]))
    ).rejects.toThrow(/permission denied/);
  });

  it('refuse the admin membership tool to non-admin members', async () => {
    await expect(
      env.as(bob, (q) => q(`select public.admin_set_membership($1, true)`, [bob.id]))
    ).rejects.toThrow();
    const res = await env.db.query<{ is_subscribed: boolean }>(`select is_subscribed from public.profiles where id = $1`, [bob.id]);
    expect(res.rows[0].is_subscribed).toBe(false);
  });

  it('let an admin switch a membership on', async () => {
    await env.as(admin, (q) => q(`select public.admin_set_membership($1, true)`, [bob.id]));
    const res = await env.db.query<{ is_subscribed: boolean }>(`select is_subscribed from public.profiles where id = $1`, [bob.id]);
    expect(res.rows[0].is_subscribed).toBe(true);
  });

  it("don't let members read other people's vouchers or redemptions", async () => {
    for (const table of ['redemption_tokens', 'redemptions']) {
      const res = await env.as(alice, (q) => q(`select * from public.${table}`));
      expect(res.rows, table).toHaveLength(0);
    }
  });
});

describe('legal notices', () => {
  beforeAll(async () => {
    await env.as(admin, (q) =>
      q(`insert into public.legal_notices (category, title, body, is_active) values
         ('tender', 'Open tender', 'Body of the open tender', true),
         ('tender', 'Withdrawn tender', 'Body of the withdrawn tender', false)`)
    );
  });

  it('show only active notices to the public', async () => {
    const res = await env.as(null, (q) => q<{ title: string }>(`select title from public.legal_notices`));
    expect(res.rows.map((r) => r.title)).toEqual(['Open tender']);
  });

  it('can only be published by admins', async () => {
    await expect(
      env.as(alice, (q) =>
        q(`insert into public.legal_notices (category, title, body) values ('claim', 'Fake', 'Fake notice body')`)
      )
    ).rejects.toThrow();
  });
});
