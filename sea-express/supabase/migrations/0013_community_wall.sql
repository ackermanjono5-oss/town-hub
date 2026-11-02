-- Community Wall: lost & found pets, stranded motorists, safety alerts and
-- community notices, posted by signed-in members. Apply after 0012.
--
-- Posts go live straight away; the guidelines (/guidelines) set the rules
-- and moderation is after the fact:
--   * any member can report a post, once;
--   * a post with 3 reports is hidden automatically until an admin looks;
--   * admins hide, restore or delete posts from /admin/wall;
--   * authors can delete their own posts.
--
-- A new table name rather than community_posts: that name belongs to an
-- earlier version of the app and may still exist with a different shape.

create table if not exists public.wall_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  -- Copied from the author's profile when the post is made (see
  -- wall_posts_before_insert): profiles aren't publicly readable.
  author_name text not null default 'Member',
  category text not null check (category in ('lost_found', 'motorist', 'safety', 'notice')),
  -- Town slug from lib/garden-route/towns.ts; null for region-wide posts.
  town text,
  body text not null check (char_length(btrim(body)) between 10 and 1000),
  -- Optional phone number or other way to reach the poster.
  contact text check (contact is null or char_length(contact) <= 120),
  report_count integer not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists wall_posts_created_idx on public.wall_posts (created_at desc);

create table if not exists public.wall_reports (
  post_id uuid not null references public.wall_posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  reason text check (reason is null or char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  primary key (post_id, reporter_id)
);

-- Fills in the author and keeps posting within reason: the author is
-- always the caller, the name comes from their profile, hidden/report
-- fields can't be preset, and nobody posts more than 5 times a day.
create or replace function public.wall_posts_before_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recent integer;
begin
  new.author_id := auth.uid();
  new.report_count := 0;
  new.is_hidden := false;
  new.created_at := now();
  new.body := btrim(new.body);
  new.contact := nullif(btrim(coalesce(new.contact, '')), '');

  select coalesce(nullif(btrim(p.full_name), ''), 'Member') into new.author_name
  from public.profiles p where p.id = new.author_id;
  new.author_name := coalesce(new.author_name, 'Member');

  select count(*) into recent
  from public.wall_posts w
  where w.author_id = new.author_id and w.created_at > now() - interval '1 day';
  if recent >= 5 then
    raise exception 'You can post up to 5 times a day. Please try again tomorrow.';
  end if;

  return new;
end;
$$;

drop trigger if exists wall_posts_before_insert on public.wall_posts;
create trigger wall_posts_before_insert
  before insert on public.wall_posts
  for each row execute function public.wall_posts_before_insert();

-- Counts a report and hides the post at the third.
create or replace function public.wall_reports_after_insert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.wall_posts
  set report_count = report_count + 1,
      is_hidden = is_hidden or report_count + 1 >= 3
  where id = new.post_id;
  return new;
end;
$$;

drop trigger if exists wall_reports_after_insert on public.wall_reports;
create trigger wall_reports_after_insert
  after insert on public.wall_reports
  for each row execute function public.wall_reports_after_insert();

alter table public.wall_posts enable row level security;
alter table public.wall_reports enable row level security;

-- Visible posts are public, like the wall itself. Authors still see their
-- own hidden posts; admins see everything.
drop policy if exists "wall_posts_public_select" on public.wall_posts;
create policy "wall_posts_public_select"
  on public.wall_posts for select to anon, authenticated
  using (not is_hidden or author_id = auth.uid() or public.is_admin());

drop policy if exists "wall_posts_member_insert" on public.wall_posts;
create policy "wall_posts_member_insert"
  on public.wall_posts for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "wall_posts_author_delete" on public.wall_posts;
create policy "wall_posts_author_delete"
  on public.wall_posts for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Only admins change a post after it's made (hide / restore).
drop policy if exists "wall_posts_admin_update" on public.wall_posts;
create policy "wall_posts_admin_update"
  on public.wall_posts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Members report posts other than their own; admins read the reports.
drop policy if exists "wall_reports_member_insert" on public.wall_reports;
create policy "wall_reports_member_insert"
  on public.wall_reports for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and exists (select 1 from public.wall_posts w where w.id = post_id and w.author_id <> auth.uid())
  );

drop policy if exists "wall_reports_select" on public.wall_reports;
create policy "wall_reports_select"
  on public.wall_reports for select to authenticated
  using (reporter_id = auth.uid() or public.is_admin());
