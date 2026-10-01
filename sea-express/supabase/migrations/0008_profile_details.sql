-- Gives a profile the details a member actually recognises as "their
-- account": an avatar, a home town and a contact number, alongside the
-- display name 0007 made editable.
--
-- avatar stores an id from components/Avatar.tsx (e.g. 'whale'), not a URL
-- or an image. The app ships offline inside a WebView, so an uploaded photo
-- would need storage, connectivity and a signed URL to render — none of
-- which exist on a plane or in a reception dead-spot. A picked avatar is a
-- short string that renders from bundled SVG and always works.
--
-- home_town stores a town slug from lib/garden-route/towns.ts. Deliberately
-- a plain text column rather than a foreign key: the gazetteer is generated
-- from OpenStreetMap and regenerating it must not be able to fail on a
-- constraint, or break someone's profile because a slug was renamed.

alter table public.profiles
  add column if not exists avatar text,
  add column if not exists home_town text,
  add column if not exists phone text;

-- Same split as 0007: the policy picks the row, the grant picks the
-- columns. Re-granting full_name alongside the new ones because a column
-- grant replaces the previous list for these columns rather than adding to
-- it, and leaving it out would silently make the name read-only again.
grant update (full_name, avatar, home_town, phone) on public.profiles to authenticated;
