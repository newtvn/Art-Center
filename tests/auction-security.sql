-- Run only against the isolated fixture described in docs/auctions.md.
\set ON_ERROR_STOP on
begin;
create function public.test_reject(command text, expected text) returns void language plpgsql as $$
begin
 begin execute command; exception when others then
  if sqlerrm not like '%'||expected||'%' then raise exception 'Wrong rejection: %',sqlerrm; end if;
  return;
 end;
 raise exception 'Expected rejection: %',command;
end $$;
grant execute on function public.test_reject(text,text) to authenticated,anon;
set role anon;
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',100)','permission denied');
reset role;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
select public.test_reject('select public.configure_auction(''10000000-0000-0000-0000-000000000001'',100,5,now()+interval ''1 day'')','Only the artist');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select public.configure_auction('10000000-0000-0000-0000-000000000001',100,5,now()+interval '1 day');
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',100)','own artwork');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000004';
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',100)','Verify your email');
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
select public.test_reject('insert into public.bids(artwork_id,bidder_id,amount) values(''10000000-0000-0000-0000-000000000001'',''00000000-0000-0000-0000-000000000002'',100)','permission denied');
select public.test_reject('update public.auctions set current_price=1','permission denied');
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',99)','minimum bid');
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',100.001)','valid amount');
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',''NaN''::numeric)','valid amount');
select public.place_bid('10000000-0000-0000-0000-000000000001',100);
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',100)','minimum bid');
do $$begin if (select count(*) from public.bids)<>1 then raise exception 'Bidder must see own bid'; end if; end$$;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000003';
do $$begin if (select count(*) from public.bids)<>0 then raise exception 'Other bids exposed'; end if; end$$;
select public.place_bid('10000000-0000-0000-0000-000000000001',105);
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';
select public.test_reject('select public.configure_auction(''10000000-0000-0000-0000-000000000001'',100,5,now()+interval ''2 days'')','cannot be changed');
reset role;
update public.auctions set ends_at=clock_timestamp()-interval '1 second';
set role authenticated;
set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';
select public.test_reject('select public.place_bid(''10000000-0000-0000-0000-000000000001'',110)','ended');
reset role;
do $$begin if (select bid_count from public.auctions)<>2 or (select current_price from public.auctions)<>105 or (select count(*) from public.bids)<>2 then raise exception 'Bid totals are inconsistent';end if;end$$;
rollback;
\echo 'PASS: authentication, ownership, precision, minimums, privacy, immutable terms, deadlines, atomic totals'
