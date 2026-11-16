-- Property listings posted by estate agencies. Apply after 0013.
--
-- Agencies use their Business Rewards Portal account: once Town Hub has
-- approved the business (and it is an active advertiser — see
-- business_is_eligible), its owner can add listings from the portal.
--
-- Every listing is checked before it goes live, like reward offers:
--   draft → submitted → approved (live) or rejected (with a note).
-- Editing a live listing's details sends it back for review. Marking it
-- sold or let doesn't — that only ever takes a listing off the market.
--
-- Photos go in the public property-photos bucket, under the uploader's
-- own folder ({user id}/...), at most 6 per listing.

create table if not exists public.property_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),

  listing_type text not null check (listing_type in ('sale', 'rent')),
  property_type text not null check (
    property_type in ('house', 'apartment', 'townhouse', 'vacant_land', 'farm', 'commercial')
  ),
  title text not null check (char_length(btrim(title)) between 5 and 120),
  description text check (description is null or char_length(description) <= 4000),
  -- Rand. For rentals, per month.
  price numeric(12, 0) not null check (price >= 0),
  bedrooms smallint check (bedrooms between 0 and 50),
  bathrooms numeric(3, 1) check (bathrooms between 0 and 50),
  garages smallint check (garages between 0 and 50),
  -- Square metres.
  floor_size integer check (floor_size between 1 and 1000000),
  erf_size integer check (erf_size between 1 and 100000000),
  -- Town slug from lib/garden-route/towns.ts, plus an optional suburb or
  -- estate. No street address: agencies decide who gets that.
  town text not null,
  suburb text check (suburb is null or char_length(suburb) <= 80),
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  -- The listing on the agency's own website, if they want to link it.
  agency_url text check (agency_url is null or agency_url ~* '^https?://'),
  agent_name text check (agent_name is null or char_length(agent_name) <= 80),
  agent_phone text check (agent_phone is null or char_length(agent_phone) <= 30),
  agent_email text check (agent_email is null or char_length(agent_email) <= 120),
  -- The agency's trading name, copied from businesses (which the public
  -- can't read) by property_listings_set_agency below.
  agency_name text,

  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'rejected')),
  is_sold boolean not null default false,
  review_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists property_listings_live_idx
  on public.property_listings (town, listing_type, created_at desc)
  where status = 'approved';
create index if not exists property_listings_business_idx on public.property_listings (business_id);

drop trigger if exists property_listings_set_updated_at on public.property_listings;
create trigger property_listings_set_updated_at
  before update on public.property_listings
  for each row execute function public.set_updated_at();

-- Agencies write drafts and submit them; only Town Hub approves. Same shape
-- as guard_offer_write in 0011.
create or replace function public.guard_property_listing_write()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'authenticated' and not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.status not in ('draft', 'submitted') then
        raise exception 'NOT_ALLOWED: listings must be approved by Town Hub' using errcode = '42501';
      end if;
      new.created_by := auth.uid();
      new.review_note := null;
      new.reviewed_at := null;
      new.reviewed_by := null;
    else
      if new.review_note is distinct from old.review_note
        or new.reviewed_at is distinct from old.reviewed_at
        or new.reviewed_by is distinct from old.reviewed_by
        or new.business_id is distinct from old.business_id
        or new.created_by is distinct from old.created_by then
        raise exception 'NOT_ALLOWED: only Town Hub can review listings' using errcode = '42501';
      end if;

      if (new.listing_type, new.property_type, new.title, new.description, new.price,
          new.bedrooms, new.bathrooms, new.garages, new.floor_size, new.erf_size,
          new.town, new.suburb, new.photos, new.agency_url,
          new.agent_name, new.agent_phone, new.agent_email)
         is distinct from
         (old.listing_type, old.property_type, old.title, old.description, old.price,
          old.bedrooms, old.bathrooms, old.garages, old.floor_size, old.erf_size,
          old.town, old.suburb, old.photos, old.agency_url,
          old.agent_name, old.agent_phone, old.agent_email) then
        -- Changed details go back to Town Hub before they're shown.
        if new.status not in ('draft', 'submitted') then
          new.status := 'submitted';
        end if;
      elsif new.status is distinct from old.status and new.status not in ('draft', 'submitted') then
        raise exception 'NOT_ALLOWED: listings must be approved by Town Hub' using errcode = '42501';
      end if;
    end if;

    if new.status = 'submitted' and (tg_op = 'INSERT' or old.status <> 'submitted') then
      new.submitted_at := now();
    end if;
  end if;
  return new;
end;
$$;

-- Keeps agency_name in step with the agency's trading name.
create or replace function public.property_listings_set_agency()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  select coalesce(nullif(btrim(b.trading_name), ''), b.name) into new.agency_name
  from public.businesses b where b.id = new.business_id;
  return new;
end;
$$;

drop trigger if exists property_listings_set_agency on public.property_listings;
create trigger property_listings_set_agency
  before insert or update of business_id on public.property_listings
  for each row execute function public.property_listings_set_agency();

drop trigger if exists property_listings_guard_write on public.property_listings;
create trigger property_listings_guard_write
  before insert or update on public.property_listings
  for each row execute function public.guard_property_listing_write();

alter table public.property_listings enable row level security;

-- Live listings are public, from agencies Town Hub still lists.
drop policy if exists "property_listings_public_select" on public.property_listings;
create policy "property_listings_public_select"
  on public.property_listings for select to anon, authenticated
  using (status = 'approved' and public.business_is_eligible(business_id));

-- The agency sees all of its own listings, in any state.
drop policy if exists "property_listings_owner_select" on public.property_listings;
create policy "property_listings_owner_select"
  on public.property_listings for select to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

-- Only an eligible agency's owner adds or edits listings (the trigger above
-- keeps approval with Town Hub).
drop policy if exists "property_listings_owner_insert" on public.property_listings;
create policy "property_listings_owner_insert"
  on public.property_listings for insert to authenticated
  with check (
    public.business_is_eligible(business_id)
    and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

drop policy if exists "property_listings_owner_update" on public.property_listings;
create policy "property_listings_owner_update"
  on public.property_listings for update to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (
    public.business_is_eligible(business_id)
    and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

drop policy if exists "property_listings_owner_delete" on public.property_listings;
create policy "property_listings_owner_delete"
  on public.property_listings for delete to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

drop policy if exists "property_listings_admin_manage" on public.property_listings;
create policy "property_listings_admin_manage"
  on public.property_listings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Photos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  true,
  3145728, -- 3 MB. The app scales photos to 1600px before upload (~300 KB).
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "property_photos_public_read" on storage.objects;
create policy "property_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'property-photos');

drop policy if exists "property_photos_insert_own" on storage.objects;
create policy "property_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "property_photos_delete_own" on storage.objects;
create policy "property_photos_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'property-photos' and (storage.foldername(name))[1] = auth.uid()::text);
