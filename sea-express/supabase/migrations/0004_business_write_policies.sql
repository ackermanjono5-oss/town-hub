-- Town Hub Rewards — Phase 2: employees, business_registration_codes,
-- and the real (non-stub) business-owner RLS policies that replace the
-- commented Phase-1 stubs. Apply via Supabase SQL Editor, after 0003.

-- ---------------------------------------------------------------------
-- employees
-- Staff sub-accounts under a business, distinct from the owner. role is
-- free text (not an enum) — same reasoning offer_type already applied:
-- Phase 2 only needs 'staff', and an enum would mean an ALTER TYPE for
-- any future tier. No UI creates rows here yet (Settings/Employees
-- screen is explicitly out of scope this pass) — the table/RLS exist so
-- that screen is a pure UI increment later, no further schema work.
-- ---------------------------------------------------------------------
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, profile_id)
);

create index employees_business_id_idx on public.employees (business_id);
create index employees_profile_id_idx on public.employees (profile_id);

-- ---------------------------------------------------------------------
-- business_registration_codes
-- Admin-minted, single-use codes tied to a specific pre-created business
-- row. The admin creates the business first, then mints a code for it —
-- register-business attaches the caller as owner to that existing row
-- rather than inserting a new business, avoiding a duplicate-row bug.
-- business_name_hint is a denormalized display convenience for the
-- admin UI, not authoritative — businesses.name is.
-- ---------------------------------------------------------------------
create table public.business_registration_codes (
  code text primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  is_used boolean not null default false,
  business_name_hint text,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid references public.profiles(id)
);

create index business_registration_codes_business_id_idx
  on public.business_registration_codes (business_id);

-- ---------------------------------------------------------------------
-- Helper: is the caller the owner OR an active staff member of the given
-- business? Centralizes the two-table exists() so every member-scoped
-- SELECT policy below (and future ones) stays a one-liner.
-- ---------------------------------------------------------------------
create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = target_business_id and b.owner_id = auth.uid()
  ) or exists (
    select 1 from public.employees e
    where e.business_id = target_business_id and e.profile_id = auth.uid() and e.is_active = true
  );
$$;

-- ---------------------------------------------------------------------
-- Atomically attach a caller as owner of the business a code unlocks.
-- Wrapped in a single Postgres function (not sequential JS calls from
-- the Edge Function) because this touches three tables and genuinely
-- needs transactional atomicity — a partial failure (code marked used
-- but business never claimed) would be a real correctness bug, not
-- just a UX nit.
-- ---------------------------------------------------------------------
create or replace function public.register_business_with_code(p_code text, p_owner_id uuid)
returns public.businesses
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_id uuid;
  v_updated int;
  v_business public.businesses;
begin
  select business_id into v_business_id
    from public.business_registration_codes
    where code = p_code;

  if v_business_id is null then
    raise exception 'INVALID_CODE';
  end if;

  if exists (select 1 from public.businesses where id = v_business_id and owner_id is not null) then
    raise exception 'BUSINESS_ALREADY_CLAIMED';
  end if;

  update public.business_registration_codes
    set is_used = true, used_at = now(), used_by = p_owner_id
    where code = p_code and is_used = false;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'CODE_ALREADY_USED';
  end if;

  update public.businesses
    set owner_id = p_owner_id
    where id = v_business_id
    returning * into v_business;

  update public.profiles set role = 'business_owner' where id = p_owner_id;

  return v_business;
end;
$$;

-- Only register-business's service-role client may call this — same
-- "server-side only" pattern the whole schema uses for token writes.
revoke execute on function public.register_business_with_code(text, uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- RLS: enable on new tables
-- ---------------------------------------------------------------------
alter table public.employees enable row level security;
alter table public.business_registration_codes enable row level security;

create policy "employees_owner_manage"
  on public.employees for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "employees_self_select"
  on public.employees for select
  to authenticated
  using (profile_id = auth.uid());

-- No policies on business_registration_codes for `authenticated` here —
-- register-business's service-role client (bypasses RLS) is the only
-- authenticated-context reader/writer until 0005 adds admin policies.

-- ---------------------------------------------------------------------
-- businesses / branches / offers: replace the Phase 1 stub comments.
-- Split owner "manage" (all commands) from a separate member "select"
-- (owner+employee) — NOT combined into one `for all` using
-- is_business_member(), because Postgres RLS only evaluates USING for
-- DELETE (not WITH CHECK), so a combined policy would let employees
-- delete rows. Splitting keeps staff strictly read-only.
-- ---------------------------------------------------------------------
create policy "businesses_owner_manage"
  on public.businesses for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "businesses_member_select"
  on public.businesses for select
  to authenticated
  using (public.is_business_member(id));

create policy "branches_owner_manage"
  on public.branches for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "branches_member_select"
  on public.branches for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "offers_owner_manage"
  on public.offers for all
  to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create policy "offers_member_select"
  on public.offers for select
  to authenticated
  using (public.is_business_member(business_id));

-- ---------------------------------------------------------------------
-- redemption_tokens / redemptions: business owner+staff read-only, for
-- the new business app's /redemptions page (a plain RLS-scoped client
-- read, matching lib/rewards/queries.ts's style rather than routing
-- through an Edge Function). No write policy — writes stay
-- service-role-only via approve-redemption, unchanged from Phase 1.
-- ---------------------------------------------------------------------
create policy "redemption_tokens_business_select"
  on public.redemption_tokens for select
  to authenticated
  using (public.is_business_member(business_id));

create policy "redemptions_business_select"
  on public.redemptions for select
  to authenticated
  using (public.is_business_member(business_id));
