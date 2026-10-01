-- Town Hub Rewards — Phase 3: admin RLS. Apply after 0004.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- profiles: admin reads everyone (customer/business lists). No admin
-- UPDATE policy yet — role/is_subscribed/suspend changes stay SQL-Editor-
-- only until a dedicated Edge Function exists (same deferral Phase 1
-- already made for is_subscribed, for the same reason).
create policy "profiles_admin_select"
  on public.profiles for select to authenticated using (public.is_admin());

-- businesses: admin reads all + creates new business rows (the
-- /admin/businesses "create business" step, ahead of any code
-- redemption). No admin UPDATE/DELETE — suspending a business is
-- explicitly deferred.
create policy "businesses_admin_select"
  on public.businesses for select to authenticated using (public.is_admin());
create policy "businesses_admin_insert"
  on public.businesses for insert to authenticated with check (public.is_admin());

create policy "branches_admin_select"
  on public.branches for select to authenticated using (public.is_admin());

-- offers: admin full manage across every business — powers
-- /admin/offers create/edit/toggle-active. Owner's own offers_owner_manage
-- policy from 0004 still applies independently for the owner's own writes.
create policy "offers_admin_manage"
  on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- redemption_tokens: admin read-only (debugging/support visibility).
create policy "redemption_tokens_admin_select"
  on public.redemption_tokens for select to authenticated using (public.is_admin());

-- redemptions: admin read-only — powers /admin/redemptions. No write/
-- delete policy — "cancel a fraudulent redemption" needs a dedicated
-- Edge Function to also safely reverse the token, deferred per scope.
create policy "redemptions_admin_select"
  on public.redemptions for select to authenticated using (public.is_admin());

create policy "employees_admin_select"
  on public.employees for select to authenticated using (public.is_admin());

-- business_registration_codes: admin reads (outstanding/used codes) and
-- inserts (mints a code from /admin/businesses). No update/delete for
-- `authenticated` — a code is only ever marked used by
-- register-business's service-role client.
create policy "business_registration_codes_admin_select"
  on public.business_registration_codes for select to authenticated using (public.is_admin());
create policy "business_registration_codes_admin_insert"
  on public.business_registration_codes for insert to authenticated with check (public.is_admin());
