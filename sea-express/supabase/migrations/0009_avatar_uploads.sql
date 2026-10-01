-- Photo avatars: a storage bucket for uploaded profile pictures, plus the
-- column that points at one.
--
-- Why a public bucket. The app renders avatars inside an offline WebView
-- with no server to mint signed URLs, and a signed URL expires — a cached
-- profile picture would turn into a broken image the moment the signature
-- aged out. Public read keeps the URL stable and cacheable. Nothing secret
-- lives here: it is a picture the member chose to show other members.
--
-- Writes are not public. The policies below scope insert/update/delete to
-- the signed-in user's own folder, so <uid>/avatar.jpg can only be written
-- by that uid. Without the folder check any authenticated user could
-- overwrite anyone's picture.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB. The client downscales to ~256px before upload, so a file
           -- anywhere near this ceiling means something bypassed that path.
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- storage.foldername(name)[1] is the first path segment: the owner's uid.
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatar_url holds the public URL of an uploaded photo. It takes precedence
-- over the picked `avatar` illustration, and clearing it falls back to that
-- illustration rather than leaving the member with nothing.
alter table public.profiles
  add column if not exists avatar_url text;

-- Same split as 0007/0008: policy picks the row, grant picks the columns,
-- and the full list has to be restated because a column grant replaces it.
grant update (full_name, avatar, home_town, phone, avatar_url) on public.profiles to authenticated;
