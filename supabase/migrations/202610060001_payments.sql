-- Pesapal payments. Apply after the gallery and auction migrations.
-- Orders are written only by Edge Functions using the service role.
begin;
alter table public.artworks add column if not exists sold_at timestamptz;

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 artwork_id uuid not null references public.artworks(id) on delete restrict,
 buyer_id uuid not null references auth.users(id),
 kind text not null check (kind in ('purchase','auction')),
 amount numeric(12,2) not null check (amount > 0),
 currency text not null default 'USD',
 status text not null default 'pending' check (status in ('pending','completed','failed','reversed','invalid')),
 order_tracking_id text,
 payment_method text,
 confirmation_code text,
 needs_refund boolean not null default false,
 expires_at timestamptz not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists orders_artwork_idx on public.orders(artwork_id, status);
create index if not exists orders_buyer_idx on public.orders(buyer_id, created_at desc);
-- At most one paid order per artwork.
create unique index if not exists orders_one_completed_per_artwork on public.orders(artwork_id) where status = 'completed' and not needs_refund;

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
drop policy if exists "Buyers read own orders" on public.orders;
create policy "Buyers read own orders" on public.orders for select to authenticated using (buyer_id = (select auth.uid()));

-- Creates (or reuses) a pending order and holds the artwork for 30 minutes.
create or replace function public.reserve_order(p_artwork_id uuid, p_buyer_id uuid, p_kind text, p_amount numeric)
returns public.orders language plpgsql security definer set search_path = '' as $$
declare art public.artworks; result public.orders;
begin
 select * into art from public.artworks where id = p_artwork_id for update;
 if not found then raise exception 'Artwork not found.'; end if;
 if art.sold_at is not null then raise exception 'This piece has already been sold.'; end if;
 if exists (select 1 from public.orders where artwork_id = p_artwork_id and status = 'pending' and expires_at > now() and buyer_id <> p_buyer_id) then
  raise exception 'Another collector is completing payment for this piece. Please try again shortly.';
 end if;
 update public.orders set status = 'invalid', updated_at = now()
  where artwork_id = p_artwork_id and buyer_id = p_buyer_id and status = 'pending' and order_tracking_id is null and (amount <> p_amount or kind <> p_kind);
 select * into result from public.orders where artwork_id = p_artwork_id and buyer_id = p_buyer_id and status = 'pending' and kind = p_kind and amount = p_amount and expires_at > now() order by created_at desc limit 1;
 if found then
  update public.orders set expires_at = now() + interval '30 minutes', updated_at = now() where id = result.id returning * into result;
  return result;
 end if;
 insert into public.orders(artwork_id, buyer_id, kind, amount, expires_at) values (p_artwork_id, p_buyer_id, p_kind, p_amount, now() + interval '30 minutes') returning * into result;
 return result;
end $$;

-- Applies a verified Pesapal status. Idempotent; completed orders never regress.
create or replace function public.settle_order(p_order_id uuid, p_status text, p_tracking_id text, p_method text, p_confirmation text)
returns public.orders language plpgsql security definer set search_path = '' as $$
declare ord public.orders; art public.artworks;
begin
 if p_status not in ('pending','completed','failed','reversed','invalid') then raise exception 'Unknown status.'; end if;
 select * into ord from public.orders where id = p_order_id for update;
 if not found then raise exception 'Order not found.'; end if;
 if ord.status = 'completed' and p_status <> 'reversed' then return ord; end if;
 select * into art from public.artworks where id = ord.artwork_id for update;
 if p_status = 'completed' then
  update public.orders set status='completed', order_tracking_id=coalesce(p_tracking_id,order_tracking_id), payment_method=p_method, confirmation_code=p_confirmation,
   needs_refund = (art.sold_at is not null), updated_at=now() where id = p_order_id returning * into ord;
  if art.sold_at is null then update public.artworks set sold_at = now() where id = ord.artwork_id; end if;
 elsif p_status = 'reversed' then
  update public.orders set status='reversed', needs_refund=false, updated_at=now() where id = p_order_id returning * into ord;
  if ord.status = 'reversed' then update public.artworks set sold_at = null
   where id = ord.artwork_id and not exists (select 1 from public.orders o where o.artwork_id = ord.artwork_id and o.status='completed' and o.id <> ord.id); end if;
 else
  update public.orders set status=p_status, order_tracking_id=coalesce(p_tracking_id,order_tracking_id), updated_at=now() where id = p_order_id returning * into ord;
 end if;
 return ord;
end $$;

revoke all on function public.reserve_order(uuid,uuid,text,numeric) from public, anon, authenticated;
revoke all on function public.settle_order(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.reserve_order(uuid,uuid,text,numeric) to service_role;
grant execute on function public.settle_order(uuid,text,text,text,text) to service_role;

-- Block new bids on sold pieces.
create or replace function public.place_bid(p_artwork_id uuid, p_amount numeric)
returns public.auctions language plpgsql security definer set search_path = '' as $$
declare auction public.auctions; minimum numeric;
begin
 if auth.uid() is null then raise exception 'Sign in before placing a bid.'; end if;
 if not exists (select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Verify your email before bidding.'; end if;
 select * into auction from public.auctions where artwork_id=p_artwork_id for update;
 if not found then raise exception 'This piece is not open for bidding.'; end if;
 if auction.ends_at <= clock_timestamp() then raise exception 'This auction has ended.'; end if;
 if exists(select 1 from public.artworks where id=p_artwork_id and sold_at is not null) then raise exception 'This piece has already been sold.'; end if;
 if exists(select 1 from public.artworks where id=p_artwork_id and artist_id=auth.uid()) then raise exception 'You cannot bid on your own artwork.'; end if;
 minimum := case when auction.bid_count=0 then auction.starting_price else auction.current_price+auction.bid_increment end;
 if p_amount is null or p_amount <= 0 or p_amount > 9999999999.99 or p_amount <> round(p_amount,2) then raise exception 'Enter a valid amount with up to two decimal places.'; end if;
 if p_amount < minimum then raise exception 'Another bid may have arrived. The minimum bid is now USD %.', minimum; end if;
 insert into public.bids(artwork_id,bidder_id,amount) values(p_artwork_id,auth.uid(),p_amount);
 update public.auctions set current_price=p_amount,bid_count=bid_count+1,last_bid_at=clock_timestamp() where artwork_id=p_artwork_id returning * into auction;
 return auction;
end $$;
revoke all on function public.place_bid(uuid,numeric) from public, anon;
grant execute on function public.place_bid(uuid,numeric) to authenticated;
notify pgrst, 'reload schema';
commit;
