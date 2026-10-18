-- Legal Notices: deceased estates, claims, liquidations, insolvencies and
-- tenders, published for attorneys and law firms. Apply after 0009.
--
-- Firms send notices to info@seaexpress.co.za and an admin publishes them
-- from /admin/notices, so there is no public insert path.

create table if not exists public.legal_notices (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in ('deceased_estate', 'claim', 'liquidation', 'insolvency', 'tender')
  ),
  title text not null,
  body text not null,
  -- Town slug from lib/garden-route/towns.ts; null for region-wide notices.
  town text,
  firm_name text,
  -- Estate number, case number or tender reference.
  reference text,
  contact text,
  published_on date not null default current_date,
  -- Last day to lodge claims / submit tenders; null when not applicable.
  closes_on date,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists legal_notices_category_published_idx
  on public.legal_notices (category, published_on desc);

alter table public.legal_notices enable row level security;

-- Notices are public by nature, so anyone — signed in or not — reads the
-- active ones.
create policy "legal_notices_public_select"
  on public.legal_notices for select to anon, authenticated using (is_active);

-- Admins see inactive notices too and manage everything.
create policy "legal_notices_admin_manage"
  on public.legal_notices for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
