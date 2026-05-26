-- Party photos storage bucket for Supabase Storage
-- Photos are stored at: party-photos/{party_id}/{photo_id}.{ext}

insert into storage.buckets (id, name, public)
values ('party-photos', 'party-photos', true)
on conflict (id) do update set public = true;

-- RLS policies on storage.objects for party-photos bucket
-- Path format: {party_id}/{photo_id}.{ext}
-- Use existing helpers: user_is_party_owner, user_is_party_collaborator

create policy "Party owners and collaborators can upload photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'party-photos'
  and (
    public.user_is_party_owner(((storage.foldername(name))[1])::uuid)
    or public.user_is_party_collaborator(((storage.foldername(name))[1])::uuid)
  )
);

create policy "Party owners and collaborators can update photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'party-photos'
  and (
    public.user_is_party_owner(((storage.foldername(name))[1])::uuid)
    or public.user_is_party_collaborator(((storage.foldername(name))[1])::uuid)
  )
);

create policy "Party owners and collaborators can delete photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'party-photos'
  and (
    public.user_is_party_owner(((storage.foldername(name))[1])::uuid)
    or public.user_is_party_collaborator(((storage.foldername(name))[1])::uuid)
  )
);
