-- Town Hub Rewards — Phase 4: self-serve business registration.
-- Lets a signed-in customer register their own business (pending admin
-- approval) instead of requiring an admin to pre-create it and mint a
-- registration code first. The admin-issued-code path from 0004 still
-- works unchanged and coexists with this one. Apply after 0005.

-- ---------------------------------------------------------------------
-- businesses: split the Phase 2 "owner manage" policy so INSERT isn't
-- bundled in with UPDATE/DELETE. Self-registration needs its own INSERT
-- policy that forces is_active = false (pending review) — a single
-- `for all using(owner_id = auth.uid())` policy can't express that,
-- since `using` doesn't constrain new rows, so it would let an owner
-- insert is_active = true directly and skip moderation entirely.
-- ---------------------------------------------------------------------
drop policy "businesses_owner_manage" on public.businesses;

create policy "businesses_owner_update"
  on public.businesses for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "businesses_self_register"
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid() and is_active = false);

-- Admin can now flip is_active to approve a pending self-registered
-- business (Phase 1-3 only ever gave admin SELECT/INSERT on businesses).
create policy "businesses_admin_update"
  on public.businesses for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Promote a self-registering customer to business_owner the moment their
-- business row lands, mirroring what register_business_with_code already
-- does for the admin-code path. Guarded to role = 'customer' so it never
-- downgrades an admin/employee who happens to own a business row.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_business_owner()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.owner_id is not null then
    update public.profiles
      set role = 'business_owner'
      where id = new.owner_id and role = 'customer';
  end if;
  return new;
end;
$$;

create trigger on_business_insert_promote_owner
  after insert on public.businesses
  for each row execute function public.handle_new_business_owner();
