-- Lets a signed-in user edit their own display name — and nothing else.
--
-- 0003 deferred this deliberately, noting there was "no safe column-level
-- RLS trick for 'user can edit full_name but not is_subscribed'". There is
-- one, it just isn't RLS: RLS chooses the ROW, a column-level GRANT chooses
-- the COLUMNS. Both are needed here.
--
-- With only a row policy, this would be a privilege-escalation hole —
--   update profiles set role = 'admin' where id = auth.uid()
-- satisfies `id = auth.uid()` and would succeed. The grant below is what
-- actually stops it: `authenticated` simply has no UPDATE privilege on
-- role, is_subscribed, id or the timestamps, so those columns are rejected
-- before any policy is consulted.

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- updated_at is not writable by the user (see the grant above), so it has
-- to be maintained server-side or it would stay frozen at signup time.
create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.touch_profile_updated_at();
