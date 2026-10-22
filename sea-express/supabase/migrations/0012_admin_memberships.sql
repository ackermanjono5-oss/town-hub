-- Town Hub admin: manage customer memberships from the app. Apply after 0011.
--
-- Until now is_subscribed could only be changed in the SQL Editor:
-- authenticated users may update only their own name/avatar/town/phone
-- (column grants in 0007/0008), and auth.users — where emails live — isn't
-- readable from the app at all. These two functions give admins exactly
-- what the Members page needs and nothing more. Both check is_admin()
-- themselves, so calling them as anyone else fails.

-- Members matching a name, email or phone search (all members if blank),
-- newest first.
create or replace function public.admin_list_members(p_search text default null, p_limit integer default 100)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  home_town text,
  role text,
  is_subscribed boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  q text := nullif(trim(coalesce(p_search, '')), '');
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = '42501';
  end if;

  return query
    select p.id, p.full_name, u.email::text, p.phone, p.home_town, p.role::text, p.is_subscribed, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    where q is null
       or p.full_name ilike '%' || q || '%'
       or u.email ilike '%' || q || '%'
       or p.phone ilike '%' || q || '%'
    order by p.created_at desc
    limit least(greatest(coalesce(p_limit, 100), 1), 500);
end;
$$;

-- Switches one member's rewards membership on or off.
create or replace function public.admin_set_membership(p_user uuid, p_subscribed boolean)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'NOT_ALLOWED' using errcode = '42501';
  end if;

  update public.profiles set is_subscribed = p_subscribed where id = p_user;
  if not found then
    raise exception 'MEMBER_NOT_FOUND';
  end if;
end;
$$;

revoke execute on function public.admin_list_members(text, integer) from public, anon;
revoke execute on function public.admin_set_membership(uuid, boolean) from public, anon;
grant execute on function public.admin_list_members(text, integer) to authenticated;
grant execute on function public.admin_set_membership(uuid, boolean) to authenticated;
