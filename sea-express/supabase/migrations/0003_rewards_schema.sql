-- Town Hub Rewards — Phase 1 schema (profiles, businesses, branches, offers,
-- redemption_tokens, redemptions) + RLS.
-- Apply via the Supabase SQL Editor. scripts/run-migrations.mjs references
-- earlier migration files that don't exist on disk and isn't wired up for
-- this project yet, so it is not used to apply this file.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.profile_role as enum ('customer', 'business_owner', 'employee', 'admin');
create type public.offer_type as enum ('percentage_discount', 'fixed_discount', 'bogo', 'free_item');
create type public.token_status as enum ('available', 'used', 'expired');

-- ---------------------------------------------------------------------
-- profiles
-- One row per auth.users row. is_subscribed is a manually-set flag for
-- Phase 1 (no billing integration yet) — toggled via SQL/dashboard until
-- a real subscription/payment flow exists.
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.profile_role not null default 'customer',
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-provision a profile row whenever a new auth user signs up (Google
-- OAuth or magic link), so every customer has a row for is_subscribed/role
-- checks without extra app code.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic updated_at maintenance, reused by profiles/businesses/offers.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null, -- Phase 2: business_owner
  name text not null,
  description text,
  logo_url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create index businesses_active_idx on public.businesses (is_active) where is_active;

-- ---------------------------------------------------------------------
-- branches
-- Phase 1 doesn't need multi-branch UI, but offers reference branch_id
-- (nullable = "all branches") so Phase 2 branch-specific offers/employee
-- sub-accounts don't require a schema change. Seed one default branch per
-- business during Phase 1 test data entry.
-- ---------------------------------------------------------------------
create table public.branches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null default 'Main Branch',
  address text,
  town text,
  latitude numeric,
  longitude numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index branches_business_id_idx on public.branches (business_id);

-- ---------------------------------------------------------------------
-- offers
-- offer_type enum already includes bogo/free_item for future phases;
-- Phase 1 logic only really needs percentage_discount/fixed_discount but
-- storing the full enum now avoids an ALTER TYPE later.
-- ---------------------------------------------------------------------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  title text not null,
  description text,
  offer_type public.offer_type not null default 'percentage_discount',
  discount_value numeric,
  terms text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

create index offers_business_id_idx on public.offers (business_id);
create index offers_active_idx on public.offers (is_active) where is_active;

-- ---------------------------------------------------------------------
-- redemption_tokens
-- One row per issued QR. `period` is always normalized to the first day
-- of the calendar month at issue time (date_trunc('month', now())::date).
-- Written ONLY by the redeem-offer Edge Function via the service-role
-- client — no INSERT/UPDATE policy is granted to authenticated users
-- (see RLS section). This is what makes "server-side only" enforceable.
-- ---------------------------------------------------------------------
create table public.redemption_tokens (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  period date not null,
  status public.token_status not null default 'available',
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references public.profiles(id), -- Phase 2: staff who approved the scan
  created_at timestamptz not null default now()
);

-- Supports the "does this customer already have a live token for this
-- offer this period" idempotency check in redeem-offer.
create index redemption_tokens_lookup_idx
  on public.redemption_tokens (customer_id, offer_id, period);

-- Supports Phase 2 scan validation (find by status) and a future cleanup
-- job that flips stale 'available' rows past expires_at to 'expired'.
create index redemption_tokens_status_expiry_idx
  on public.redemption_tokens (status, expires_at);

-- ---------------------------------------------------------------------
-- redemptions
-- Written by the (Phase 2) approve-redemption Edge Function once a
-- business scans + approves a token. The UNIQUE constraint is the actual
-- enforcement of "one redemption per customer+offer+month" — Phase 2's
-- atomic UPDATE...WHERE status='available' RETURNING * followed by this
-- INSERT is what makes replay/race-safe. Phase 1 leaves this table
-- empty in normal use except for manual test-data simulation.
-- ---------------------------------------------------------------------
create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references public.redemption_tokens(id),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  period date not null,
  redeemed_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id), -- Phase 2: staff account
  unique (customer_id, offer_id, period)
);

create index redemptions_customer_idx on public.redemptions (customer_id);
create index redemptions_business_period_idx on public.redemptions (business_id, period);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.branches enable row level security;
alter table public.offers enable row level security;
alter table public.redemption_tokens enable row level security;
alter table public.redemptions enable row level security;

-- profiles: a user may read only their own row. No client-side UPDATE
-- policy in Phase 1 — is_subscribed/role are admin-only changes made via
-- SQL Editor / service-role, since there is no profile-editing UI yet
-- and no safe column-level RLS trick for "user can edit full_name but
-- not is_subscribed" without a trigger; deferred to Phase 2 (admin
-- portal) rather than half-built now.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- businesses / branches / offers: readable only by authenticated,
-- subscribed customers. This mirrors the app-level "become a member"
-- gate as defense in depth — an unsubscribed or logged-out user gets
-- zero rows back even if they hit the API directly.
create policy "businesses_select_subscribed"
  on public.businesses for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_subscribed = true
    )
  );

create policy "branches_select_subscribed"
  on public.branches for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_subscribed = true
    )
  );

create policy "offers_select_subscribed"
  on public.offers for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_subscribed = true
    )
  );

-- No INSERT/UPDATE/DELETE policies on businesses/branches/offers for
-- `authenticated` in Phase 1 — all writes are via SQL Editor (service
-- role bypasses RLS entirely). Phase 2 stub (commented, NOT enabled):
--
-- create policy "businesses_owner_manage"
--   on public.businesses for all
--   to authenticated
--   using (owner_id = auth.uid())
--   with check (owner_id = auth.uid());

-- redemption_tokens: customer can read only their own rows (needed for
-- the QR screen + Realtime status subscription). No INSERT/UPDATE/DELETE
-- policy for authenticated — only the service-role client inside the
-- redeem-offer Edge Function may write these rows.
create policy "redemption_tokens_select_own"
  on public.redemption_tokens for select
  to authenticated
  using (customer_id = auth.uid());

-- redemptions: customer can read their own redemption history. No write
-- policy for authenticated — only the (Phase 2) approve-redemption Edge
-- Function's service-role client writes here.
create policy "redemptions_select_own"
  on public.redemptions for select
  to authenticated
  using (customer_id = auth.uid());

-- Phase 2 stub (commented, NOT enabled) — business/employee reading
-- redemptions/tokens for their own business once the business app and
-- employee sub-accounts exist:
--
-- create policy "redemptions_business_select"
--   on public.redemptions for select
--   to authenticated
--   using (
--     exists (
--       select 1 from public.businesses b
--       where b.id = redemptions.business_id and b.owner_id = auth.uid()
--     )
--   );
