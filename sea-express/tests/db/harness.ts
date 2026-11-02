/**
 * Runs every migration in supabase/migrations against an in-memory Postgres
 * (PGlite), with just enough of Supabase around it for the SQL to apply:
 * the anon / authenticated / service_role roles, auth.users, auth.uid(),
 * auth.role(), and the storage tables the avatar migration touches.
 *
 * `as(user)` then runs statements the way PostgREST would for that user:
 * as the matching role, with the user's id where auth.uid() reads it, so
 * row-level security is exercised for real.
 */
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS = join(__dirname, '..', '..', 'supabase', 'migrations');

const SUPABASE_STUB = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.role() returns text language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), 'anon')
$$;

create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  owner uuid,
  created_at timestamptz default now()
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;

grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant all on storage.objects to anon, authenticated, service_role;
-- Supabase's defaults: the API roles get table access, and RLS decides rows.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export interface TestUser {
  id: string;
  name: string;
}

export async function createDatabase() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);

  const files = readdirSync(MIGRATIONS)
    .filter((f) => /^\d+_.+\.sql$/.test(f))
    .sort();
  for (const file of files) {
    // pgcrypto isn't bundled with PGlite; nothing the schema calls needs it
    // (gen_random_uuid is built into Postgres).
    const sql = readFileSync(join(MIGRATIONS, file), 'utf8').replace(/create extension if not exists pgcrypto;/i, '');
    try {
      await db.exec(sql);
    } catch (err) {
      throw new Error(`${file} failed to apply: ${(err as Error).message}`);
    }
  }

  let n = 0;
  /** Signs up a user (as Supabase Auth would), which creates their profile. */
  async function createUser(name: string, role: 'customer' | 'admin' = 'customer'): Promise<TestUser> {
    n += 1;
    const id = `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
    await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`, [
      id,
      `user${n}@example.com`,
      JSON.stringify({ full_name: name }),
    ]);
    if (role === 'admin') await db.query(`update public.profiles set role = 'admin' where id = $1`, [id]);
    return { id, name };
  }

  /** Runs `fn` as an API caller: a signed-in user, or anon when user is null. */
  async function as<T>(user: TestUser | null, fn: (q: typeof db.query) => Promise<T>): Promise<T> {
    await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [user?.id ?? '']);
    await db.query(`select set_config('request.jwt.claim.role', $1, false)`, [user ? 'authenticated' : 'anon']);
    await db.exec(`set role ${user ? 'authenticated' : 'anon'}`);
    try {
      return await fn(db.query.bind(db) as typeof db.query);
    } finally {
      await db.exec('reset role');
      await db.query(`select set_config('request.jwt.claim.sub', '', false)`);
    }
  }

  return { db, files, createUser, as };
}
