-- Three public-read, admin-write-only Storage buckets. Tables store only the resulting
-- URL/path (players.photo_url, teams.logo_url, sponsors.logo_url) — never binaries.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('player-photos', 'player-photos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('team-logos', 'team-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('sponsor-logos', 'sponsor-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

create policy player_photos_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'player-photos');

create policy player_photos_write on storage.objects
  for all to authenticated
  using (bucket_id = 'player-photos' and public.is_admin())
  with check (bucket_id = 'player-photos' and public.is_admin());

create policy team_logos_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'team-logos');

create policy team_logos_write on storage.objects
  for all to authenticated
  using (bucket_id = 'team-logos' and public.is_admin())
  with check (bucket_id = 'team-logos' and public.is_admin());

create policy sponsor_logos_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'sponsor-logos');

create policy sponsor_logos_write on storage.objects
  for all to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_admin())
  with check (bucket_id = 'sponsor-logos' and public.is_admin());
