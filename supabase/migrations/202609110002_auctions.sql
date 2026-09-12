-- Apply after 202609110001_gallery.sql. No sample auctions or bids are inserted.
begin;
create table if not exists public.auctions (
 artwork_id uuid primary key references public.artworks(id) on delete restrict,
 starting_price numeric(12,2) not null check (starting_price > 0),
 current_price numeric(12,2) not null check (current_price > 0),
 bid_increment numeric(12,2) not null default 1 check (bid_increment > 0),
 bid_count integer not null default 0 check (bid_count >= 0),
 ends_at timestamptz not null,
 last_bid_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.bids (
 id uuid primary key default gen_random_uuid(),
 artwork_id uuid not null references public.auctions(artwork_id) on delete restrict,
 bidder_id uuid not null references auth.users(id),
 amount numeric(12,2) not null check (amount > 0),
 created_at timestamptz not null default clock_timestamp()
);
create index if not exists bids_artwork_created_idx on public.bids(artwork_id, created_at desc);
alter table public.auctions enable row level security;
alter table public.bids enable row level security;
revoke all on public.auctions, public.bids from anon, authenticated;
grant select on public.auctions to anon, authenticated;
grant select on public.bids to authenticated;
drop policy if exists "Public auction summaries" on public.auctions;
create policy "Public auction summaries" on public.auctions for select using (true);
drop policy if exists "Bidders read own bids" on public.bids;
create policy "Bidders read own bids" on public.bids for select to authenticated using (bidder_id = (select auth.uid()));

create or replace function public.configure_auction(p_artwork_id uuid, p_starting_price numeric, p_bid_increment numeric, p_ends_at timestamptz)
returns public.auctions language plpgsql security definer set search_path = '' as $$
declare result public.auctions;
begin
 if auth.uid() is null then raise exception 'Sign in to manage auctions.'; end if;
 -- Lock the artwork to serialize concurrent setup and ownership changes.
 perform 1 from public.artworks where id = p_artwork_id and artist_id = auth.uid() for update;
 if not found then raise exception 'Only the artist can manage this auction.'; end if;
 if p_starting_price is null or p_starting_price <= 0 or p_starting_price > 9999999999.99 or p_starting_price <> round(p_starting_price,2)
 or p_bid_increment is null or p_bid_increment <= 0 or p_bid_increment > 9999999999.99 or p_bid_increment <> round(p_bid_increment,2)
 or p_ends_at is null or not isfinite(p_ends_at) or p_ends_at <= clock_timestamp() then
 raise exception 'Choose valid prices and a future closing time.'; end if;
 select * into result from public.auctions where artwork_id = p_artwork_id for update;
 if found and result.bid_count > 0 then raise exception 'An auction with bids cannot be changed.'; end if;
 insert into public.auctions(artwork_id,starting_price,current_price,bid_increment,ends_at)
 values(p_artwork_id,p_starting_price,p_starting_price,p_bid_increment,p_ends_at)
 on conflict(artwork_id) do update set starting_price=excluded.starting_price,current_price=excluded.current_price,bid_increment=excluded.bid_increment,ends_at=excluded.ends_at
 returning * into result;
 return result;
end $$;

create or replace function public.place_bid(p_artwork_id uuid, p_amount numeric)
returns public.auctions language plpgsql security definer set search_path = '' as $$
declare auction public.auctions; minimum numeric;
begin
 if auth.uid() is null then raise exception 'Sign in before placing a bid.'; end if;
 if not exists (select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Verify your email before bidding.'; end if;
 select * into auction from public.auctions where artwork_id=p_artwork_id for update;
 if not found then raise exception 'This piece is not open for bidding.'; end if;
 if auction.ends_at <= clock_timestamp() then raise exception 'This auction has ended.'; end if;
 if exists(select 1 from public.artworks where id=p_artwork_id and artist_id=auth.uid()) then raise exception 'You cannot bid on your own artwork.'; end if;
 minimum := case when auction.bid_count=0 then auction.starting_price else auction.current_price+auction.bid_increment end;
 if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99 or p_amount <> round(p_amount,2) then raise exception 'Enter a valid amount with up to two decimal places.'; end if;
 if p_amount < minimum then raise exception 'Another bid may have arrived. The minimum bid is now USD %.', minimum; end if;
 insert into public.bids(artwork_id,bidder_id,amount) values(p_artwork_id,auth.uid(),p_amount);
 update public.auctions set current_price=p_amount,bid_count=bid_count+1,last_bid_at=clock_timestamp() where artwork_id=p_artwork_id returning * into auction;
 return auction;
end $$;
revoke all on function public.configure_auction(uuid,numeric,numeric,timestamptz) from public, anon;
revoke all on function public.place_bid(uuid,numeric) from public, anon;
grant execute on function public.configure_auction(uuid,numeric,numeric,timestamptz) to authenticated;
grant execute on function public.place_bid(uuid,numeric) to authenticated;
notify pgrst, 'reload schema';
commit;
