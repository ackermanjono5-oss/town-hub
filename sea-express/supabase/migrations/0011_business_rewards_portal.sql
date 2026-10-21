-- Town Hub Rewards — Business Rewards Portal. Apply after 0010.
--
-- Fixes four defects in the 0003–0006 rewards backend and adds what the
-- Business Rewards Portal brief needs:
--
--   1. A business owner could UPDATE every column of their own business,
--      including is_active — so a pending or suspended business could switch
--      itself on. Approval and subscription columns are now admin-only.
--   2. offers_owner_manage let an owner publish offers directly. Offers now
--      go draft → submitted → approved/rejected, and only Town Hub approves.
--   3. Redemption claimed the token and inserted the redemption as two
--      separate writes, so a failure between them burned the voucher with
--      no record. It is now one transaction in redeem_voucher().
--   4. The reward month was computed in UTC, so 00:00–02:00 SAST on the 1st
--      still counted as the previous month. Periods now use
--      Africa/Johannesburg.
--
-- New: full company registration + eligibility (approval and paid
-- advertiser status), a short voucher code staff can type, a configurable
-- monthly limit per offer, and voucher snapshots of the offer's terms.
--
-- Apply via the Supabase SQL Editor, then redeploy the redeem-offer and
-- approve-redemption Edge Functions, which call the functions below.

-- ---------------------------------------------------------------------
-- Reward month, in South African time
-- ---------------------------------------------------------------------
create or replace function public.current_reward_period()
returns date
language sql
stable
as $$
  select date_trunc('month', now() at time zone 'Africa/Johannesburg')::date;
$$;

-- ---------------------------------------------------------------------
-- businesses: registration details and eligibility
-- ---------------------------------------------------------------------
alter table public.businesses
  add column if not exists registered_name text,
  add column if not exists trading_name text,
  add column if not exists registration_number text,
  -- "<source>:<id>" of the business's listing in the app's directories,
  -- e.g. 'business:mb-12' or 'restaurant:geo-3'.
  add column if not exists directory_listing_id text,
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists address text,
  add column if not exists town text,
  add column if not exists advertising_reference text,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'denied', 'suspended')),
  add column if not exists approval_note text,
  add column if not exists advertiser_status text not null default 'needs_verification'
    check (advertiser_status in ('active', 'expired', 'not_advertiser', 'needs_verification')),
  add column if not exists advertising_paid_until date,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

-- Businesses already switched on were approved by hand before this
-- workflow existed; keep them working.
update public.businesses
  set approval_status = 'approved', advertiser_status = 'active'
  where is_active and approval_status = 'pending';

-- Duplicate registrations: one record per company and per directory listing.
create unique index if not exists businesses_registration_number_key
  on public.businesses (lower(registration_number)) where registration_number is not null;
create unique index if not exists businesses_directory_listing_key
  on public.businesses (directory_listing_id) where directory_listing_id is not null;

-- A business may run rewards only while approved by Town Hub AND a paying
-- advertiser whose subscription has not lapsed.
create or replace function public.business_is_eligible(p_business_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = p_business_id
      and b.is_active
      and b.approval_status = 'approved'
      and b.advertiser_status = 'active'
      and (b.advertising_paid_until is null
           or b.advertising_paid_until >= (now() at time zone 'Africa/Johannesburg')::date)
  );
$$;

-- Fix 1. Owners may edit their contact details, never their approval or
-- subscription standing. is_active is derived from approval_status so the
-- two cannot disagree. auth.role() is 'service_role' inside Edge Functions,
-- which are trusted and pass through.
create or replace function public.guard_business_write()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    if tg_op = 'INSERT' then
      if exists (select 1 from public.businesses where owner_id = new.owner_id) then
        raise exception 'ALREADY_REGISTERED' using errcode = '23505';
      end if;
      if coalesce(trim(new.registered_name), '') = ''
        or coalesce(trim(new.registration_number), '') = ''
        or coalesce(trim(new.contact_name), '') = ''
        or coalesce(trim(new.phone), '') = ''
        or coalesce(trim(new.email), '') = ''
        or new.terms_accepted_at is null then
        raise exception 'INCOMPLETE_REGISTRATION' using errcode = '23514';
      end if;
      new.approval_status := 'pending';
      new.advertiser_status := 'needs_verification';
      new.advertising_paid_until := null;
      new.approval_note := null;
      new.reviewed_at := null;
      new.reviewed_by := null;
    elsif new.approval_status is distinct from old.approval_status
      or new.advertiser_status is distinct from old.advertiser_status
      or new.advertising_paid_until is distinct from old.advertising_paid_until
      or new.approval_note is distinct from old.approval_note
      or new.reviewed_at is distinct from old.reviewed_at
      or new.reviewed_by is distinct from old.reviewed_by
      or new.owner_id is distinct from old.owner_id
      or new.is_active is distinct from old.is_active
      or new.registration_number is distinct from old.registration_number then
      raise exception 'NOT_ALLOWED: only Town Hub can change approval or subscription status'
        using errcode = '42501';
    end if;
  end if;

  new.is_active := (new.approval_status = 'approved');
  return new;
end;
$$;

drop trigger if exists businesses_guard_write on public.businesses;
create trigger businesses_guard_write
  before insert or update on public.businesses
  for each row execute function public.guard_business_write();

-- Owners read their own business row directly. 0006 dropped the owner's
-- `for all` policy and left only is_business_member() for SELECT, which
-- can't see a row inserted by the same statement — so registering (an
-- INSERT ... RETURNING) always failed with an RLS error.
drop policy if exists "businesses_owner_select" on public.businesses;
create policy "businesses_owner_select"
  on public.businesses for select to authenticated
  using (owner_id = auth.uid());

-- A denied applicant can correct their details and apply again.
create or replace function public.resubmit_business_application()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.businesses
    set approval_status = 'pending', approval_note = null, reviewed_at = null, reviewed_by = null
    where owner_id = auth.uid() and approval_status = 'denied';
  if not found then
    raise exception 'NOTHING_TO_RESUBMIT';
  end if;
end;
$$;

revoke execute on function public.resubmit_business_application() from public, anon;
grant execute on function public.resubmit_business_application() to authenticated;

-- ---------------------------------------------------------------------
-- offers: approval workflow and monthly limit
-- ---------------------------------------------------------------------
alter table public.offers
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'rejected')),
  -- Redemptions allowed per customer, per offer, per calendar month.
  add column if not exists monthly_limit integer not null default 1
    check (monthly_limit between 1 and 31),
  add column if not exists purchase_conditions text,
  add column if not exists review_note text,
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;

-- Every existing offer was created by an admin and is already live.
update public.offers set status = 'approved' where status = 'draft';

-- Fix 2. Owners write drafts and submit them; only Town Hub approves.
-- Editing an offer's terms sends it back for review, so an approved offer
-- can never be changed without Town Hub seeing it.
create or replace function public.guard_offer_write()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.status not in ('draft', 'submitted') then
        raise exception 'NOT_ALLOWED: offers must be approved by Town Hub' using errcode = '42501';
      end if;
      new.is_active := true;
      new.review_note := null;
      new.reviewed_at := null;
      new.reviewed_by := null;
    else
      if new.is_active is distinct from old.is_active
        or new.review_note is distinct from old.review_note
        or new.reviewed_at is distinct from old.reviewed_at
        or new.reviewed_by is distinct from old.reviewed_by
        or new.business_id is distinct from old.business_id then
        raise exception 'NOT_ALLOWED: only Town Hub can review offers' using errcode = '42501';
      end if;

      if (new.title, new.description, new.terms, new.offer_type, new.discount_value,
          new.starts_at, new.ends_at, new.monthly_limit, new.purchase_conditions, new.branch_id)
         is distinct from
         (old.title, old.description, old.terms, old.offer_type, old.discount_value,
          old.starts_at, old.ends_at, old.monthly_limit, old.purchase_conditions, old.branch_id) then
        if new.status not in ('draft', 'submitted') then
          new.status := 'submitted';
        end if;
      elsif new.status is distinct from old.status and new.status not in ('draft', 'submitted') then
        raise exception 'NOT_ALLOWED: offers must be approved by Town Hub' using errcode = '42501';
      end if;
    end if;

    if new.status = 'submitted' and (tg_op = 'INSERT' or old.status <> 'submitted') then
      new.submitted_at := now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists offers_guard_write on public.offers;
create trigger offers_guard_write
  before insert or update on public.offers
  for each row execute function public.guard_offer_write();

-- Owners keep insert/update (guarded above) but may delete only offers that
-- never went live, so redemption history can't be cascaded away.
drop policy if exists "offers_owner_manage" on public.offers;
create policy "offers_owner_insert"
  on public.offers for insert to authenticated
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "offers_owner_update"
  on public.offers for update to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));
create policy "offers_owner_delete"
  on public.offers for delete to authenticated
  using (
    status in ('draft', 'rejected')
    and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
    and not exists (select 1 from public.redemption_tokens t where t.offer_id = offers.id)
  );

-- Customers see only approved offers from eligible businesses.
drop policy if exists "offers_select_subscribed" on public.offers;
create policy "offers_select_subscribed"
  on public.offers for select to authenticated
  using (
    is_active
    and status = 'approved'
    and public.business_is_eligible(business_id)
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_subscribed)
  );

-- ---------------------------------------------------------------------
-- Vouchers: typeable code, snapshot of the terms, many-per-month limit
-- ---------------------------------------------------------------------
alter table public.redemption_tokens
  add column if not exists code text,
  add column if not exists offer_title text,
  add column if not exists offer_terms text;

create unique index if not exists redemption_tokens_code_key
  on public.redemption_tokens (code) where code is not null;

-- The limit is now per offer (offers.monthly_limit), so the fixed
-- one-per-month constraint goes. Each voucher still redeems at most once.
alter table public.redemptions
  drop constraint if exists redemptions_customer_id_offer_id_period_key;
create unique index if not exists redemptions_token_id_key
  on public.redemptions (token_id) where token_id is not null;

-- Serialises voucher issue and redemption for one customer + offer + month,
-- so two tills (or two taps) can't both slip under the monthly limit.
create or replace function public.lock_reward_allowance(p_customer uuid, p_offer uuid, p_period date)
returns void
language sql
as $$
  select pg_advisory_xact_lock(hashtextextended(p_customer::text || ':' || p_offer::text || ':' || p_period::text, 0));
$$;

-- 8 characters from a 32-letter alphabet without look-alikes (no I, O, 0, 1).
-- The bytes come from the first six bytes of a v4 UUID (fully random, and
-- built in — gen_random_bytes lives in Supabase's extensions schema) plus
-- two more from a second one. 32 divides 256, so every letter is equally
-- likely.
create or replace function public.new_voucher_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
begin
  loop
    v_bytes := substring(decode(replace(gen_random_uuid()::text, '-', ''), 'hex') from 1 for 6)
            || substring(decode(replace(gen_random_uuid()::text, '-', ''), 'hex') from 1 for 2);
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.redemption_tokens t where t.code = v_code);
  end loop;
  return v_code;
end;
$$;

-- Issues (or returns the customer's live) voucher for an offer. Called only
-- by the redeem-offer Edge Function. Raises one of: NOT_SUBSCRIBED,
-- PROFILE_INCOMPLETE, OFFER_UNAVAILABLE, ALREADY_REDEEMED.
create or replace function public.issue_voucher(p_customer uuid, p_offer uuid)
returns public.redemption_tokens
language plpgsql
security definer set search_path = public
as $$
declare
  v_period date := public.current_reward_period();
  v_profile public.profiles;
  v_offer public.offers;
  v_used integer;
  v_token public.redemption_tokens;
  v_expires timestamptz;
begin
  select * into v_profile from public.profiles where id = p_customer;
  if not found or not v_profile.is_subscribed then
    raise exception 'NOT_SUBSCRIBED';
  end if;
  if coalesce(trim(v_profile.full_name), '') = '' or coalesce(trim(v_profile.phone), '') = '' then
    raise exception 'PROFILE_INCOMPLETE';
  end if;

  perform public.lock_reward_allowance(p_customer, p_offer, v_period);

  select * into v_offer from public.offers
    where id = p_offer
      and is_active
      and status = 'approved'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now());
  if not found or not public.business_is_eligible(v_offer.business_id) then
    raise exception 'OFFER_UNAVAILABLE';
  end if;

  select count(*) into v_used from public.redemptions
    where customer_id = p_customer and offer_id = p_offer and period = v_period;
  if v_used >= v_offer.monthly_limit then
    raise exception 'ALREADY_REDEEMED';
  end if;

  -- One live voucher at a time: asking again returns the same code rather
  -- than minting extra ones.
  select * into v_token from public.redemption_tokens
    where customer_id = p_customer and offer_id = p_offer and period = v_period
      and status = 'available' and expires_at > now()
    order by issued_at desc
    limit 1;
  if found then
    return v_token;
  end if;

  update public.redemption_tokens set status = 'expired'
    where customer_id = p_customer and offer_id = p_offer
      and status = 'available' and (expires_at <= now() or period <> v_period);

  -- Valid to the end of this month (SA time), or the offer's end if sooner.
  v_expires := (v_period + interval '1 month')::timestamp at time zone 'Africa/Johannesburg';
  if v_offer.ends_at is not null and v_offer.ends_at < v_expires then
    v_expires := v_offer.ends_at;
  end if;

  insert into public.redemption_tokens
    (customer_id, business_id, offer_id, period, status, expires_at, code, offer_title, offer_terms)
  values
    (p_customer, v_offer.business_id, p_offer, v_period, 'available', v_expires,
     public.new_voucher_code(), v_offer.title, v_offer.terms)
  returning * into v_token;
  return v_token;
end;
$$;

-- Fix 3. Verifies and (unless p_dry_run) redeems a voucher in a single
-- transaction: the token is locked, re-checked, marked used and recorded
-- together, so a failure leaves nothing half-done and two staff can't both
-- succeed. Called only by the approve-redemption Edge Function.
create or replace function public.redeem_voucher(
  p_token uuid,
  p_business uuid,
  p_staff uuid,
  p_dry_run boolean
)
returns table (result text, offer_title text, customer_name text, voucher_code text, redeemed_at timestamptz)
language plpgsql
security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_token public.redemption_tokens;
  v_offer public.offers;
  v_customer public.profiles;
  v_used integer;
  v_now timestamptz := now();
begin
  select * into v_token from public.redemption_tokens where id = p_token;
  if not found then
    return query select 'INVALID_TOKEN'::text, null::text, null::text, null::text, null::timestamptz;
    return;
  end if;

  perform public.lock_reward_allowance(v_token.customer_id, v_token.offer_id, v_token.period);
  select * into v_token from public.redemption_tokens where id = p_token for update;

  if v_token.business_id <> p_business then
    return query select 'WRONG_BUSINESS'::text, null::text, null::text, null::text, null::timestamptz;
    return;
  end if;
  if not public.business_is_eligible(p_business) then
    return query select 'BUSINESS_INELIGIBLE'::text, null::text, null::text, null::text, null::timestamptz;
    return;
  end if;
  if v_token.status = 'used' then
    return query select 'ALREADY_USED'::text, v_token.offer_title, null::text, v_token.code, v_token.used_at;
    return;
  end if;
  if v_token.status = 'expired' or v_token.expires_at < v_now
     or v_token.period <> public.current_reward_period() then
    return query select 'EXPIRED'::text, v_token.offer_title, null::text, v_token.code, null::timestamptz;
    return;
  end if;

  select * into v_offer from public.offers where id = v_token.offer_id;
  if not found or not v_offer.is_active or v_offer.status <> 'approved'
     or (v_offer.starts_at is not null and v_offer.starts_at > v_now)
     or (v_offer.ends_at is not null and v_offer.ends_at < v_now) then
    return query select 'OFFER_INACTIVE'::text, v_token.offer_title, null::text, v_token.code, null::timestamptz;
    return;
  end if;

  select * into v_customer from public.profiles where id = v_token.customer_id;
  if not found or not v_customer.is_subscribed then
    return query select 'NOT_SUBSCRIBED'::text, v_token.offer_title, null::text, v_token.code, null::timestamptz;
    return;
  end if;

  select count(*) into v_used from public.redemptions
    where customer_id = v_token.customer_id and offer_id = v_token.offer_id and period = v_token.period;
  if v_used >= v_offer.monthly_limit then
    return query select 'LIMIT_REACHED'::text, v_token.offer_title, v_customer.full_name, v_token.code, null::timestamptz;
    return;
  end if;

  if p_dry_run then
    return query select 'VALID'::text, v_token.offer_title, v_customer.full_name, v_token.code, null::timestamptz;
    return;
  end if;

  update public.redemption_tokens
    set status = 'used', used_at = v_now, used_by = p_staff
    where id = v_token.id;
  insert into public.redemptions (token_id, customer_id, business_id, offer_id, period, redeemed_at, approved_by)
    values (v_token.id, v_token.customer_id, v_token.business_id, v_token.offer_id, v_token.period, v_now, p_staff);

  return query select 'VALID'::text, v_token.offer_title, v_customer.full_name, v_token.code, v_now;
end;
$$;

-- Only the Edge Functions (service role) may issue or redeem vouchers.
revoke execute on function public.issue_voucher(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.redeem_voucher(uuid, uuid, uuid, boolean) from public, anon, authenticated;
revoke execute on function public.lock_reward_allowance(uuid, uuid, date) from public, anon, authenticated;
revoke execute on function public.new_voucher_code() from public, anon, authenticated;
grant execute on function public.issue_voucher(uuid, uuid) to service_role;
grant execute on function public.redeem_voucher(uuid, uuid, uuid, boolean) to service_role;
