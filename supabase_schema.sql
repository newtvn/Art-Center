-- Create Artists Table
create table artists (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  photo text,
  specialty text,
  long_bio text,
  socials jsonb default '{"instagram": "", "website": ""}'::jsonb
);

-- Create Artworks Table
create table artworks (
  id uuid default uuid_generate_v4() primary key,
  artist_id uuid references artists(id),
  title text not null,
  image text not null,
  category text,
  year text,
  price numeric,
  dimensions text
);

-- Enable Row Level Security (RLS)
alter table artists enable row level security;
alter table artworks enable row level security;

-- Create Policies (Allow read to everyone, write only to authenticated users)
create policy "Public artists are viewable by everyone." on artists for select using (true);
create policy "Public artworks are viewable by everyone." on artworks for select using (true);

create policy "Users can insert their own artist profile." on artists for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own artist profile." on artists for update using (auth.role() = 'authenticated');

create policy "Users can insert their own artworks." on artworks for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own artworks." on artworks for update using (auth.role() = 'authenticated');

-- Storage Bucket for Images
insert into storage.buckets (id, name) values ('art-center-assets', 'art-center-assets');
create policy "Public Access" on storage.objects for select using ( bucket_id = 'art-center-assets' );
create policy "Authenticated Upload" on storage.objects for insert with check ( bucket_id = 'art-center-assets' and auth.role() = 'authenticated' );
