-- Run in the Supabase SQL editor. Rerunnable; never deletes or seeds artworks.
begin;
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo text,
  specialty text,
  long_bio text,
  socials jsonb default '{}'::jsonb
);
create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id),
  title text not null,
  image text not null,
  category text,
  year text,
  price numeric,
  dimensions text
);
alter table public.artworks add column if not exists origin text;
alter table public.artworks add column if not exists long_history text;
alter table public.artworks add column if not exists inspiration_text text;
alter table public.artists enable row level security;
alter table public.artworks enable row level security;
grant select on public.artists, public.artworks to anon, authenticated;
grant insert, update on public.artists, public.artworks to authenticated;
-- Replace the original broad write policies with owner-only permissions.
drop policy if exists "Public artists are viewable by everyone." on public.artists;
drop policy if exists "Public artworks are viewable by everyone." on public.artworks;
drop policy if exists "Users can insert their own artist profile." on public.artists;
drop policy if exists "Users can update their own artist profile." on public.artists;
drop policy if exists "Users can insert their own artworks." on public.artworks;
drop policy if exists "Users can update their own artworks." on public.artworks;
create policy "Public artists are viewable by everyone." on public.artists for select using (true);
create policy "Public artworks are viewable by everyone." on public.artworks for select using (true);
create policy "Users can insert their own artist profile." on public.artists for insert to authenticated with check (id = (select auth.uid()));
create policy "Users can update their own artist profile." on public.artists for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy "Users can insert their own artworks." on public.artworks for insert to authenticated with check (artist_id = (select auth.uid()));
create policy "Users can update their own artworks." on public.artworks for update to authenticated using (artist_id = (select auth.uid())) with check (artist_id = (select auth.uid()));
insert into storage.buckets(id,name,public) values ('art-center-assets','art-center-assets',true) on conflict (id) do update set public = true;
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Artist image update" on storage.objects;
create policy "Public Access" on storage.objects for select using(bucket_id = 'art-center-assets');
create policy "Authenticated Upload" on storage.objects for insert to authenticated with check(bucket_id = 'art-center-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Artist image update" on storage.objects for update to authenticated using(bucket_id = 'art-center-assets' and (storage.foldername(name))[1] = (select auth.uid())::text) with check(bucket_id = 'art-center-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
notify pgrst, 'reload schema';
commit;
