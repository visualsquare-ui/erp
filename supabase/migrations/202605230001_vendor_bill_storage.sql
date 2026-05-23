insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-bills',
  'vendor-bills',
  false,
  10485760,
  array['application/pdf', 'image/jpeg']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated staff read vendor bill files" on storage.objects;
create policy "authenticated staff read vendor bill files"
on storage.objects
for select
to authenticated
using (bucket_id = 'vendor-bills');

drop policy if exists "authenticated staff upload vendor bill files" on storage.objects;
create policy "authenticated staff upload vendor bill files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'vendor-bills');

drop policy if exists "authenticated staff update vendor bill files" on storage.objects;
create policy "authenticated staff update vendor bill files"
on storage.objects
for update
to authenticated
using (bucket_id = 'vendor-bills')
with check (bucket_id = 'vendor-bills');

drop policy if exists "authenticated staff delete vendor bill files" on storage.objects;
create policy "authenticated staff delete vendor bill files"
on storage.objects
for delete
to authenticated
using (bucket_id = 'vendor-bills');
