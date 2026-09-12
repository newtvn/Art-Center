import test from 'node:test'
import assert from 'node:assert/strict'
import { countdown, minimumBid, bidProblem, safeReturnPath } from '../src/lib/auctions.js'
const now = Date.parse('2026-09-11T12:00:00Z')
test('countdown closes exactly at deadline and never becomes negative', () => {
 assert.equal(countdown('2026-09-11T12:00:00Z', now), 'Auction ended')
 assert.equal(countdown('2026-09-10T12:00:00Z', now), 'Auction ended')
 assert.equal(countdown('2026-09-12T13:02:03Z', now), '1d 01h 02m 03s')
 assert.equal(countdown(null, now), 'No deadline set')
})
test('first bid accepts opening price, subsequent bids require increment', () => {
 assert.equal(minimumBid({starting_price:'100.50', current_price:'100.50', bid_count:0, bid_increment:'5'}),100.5)
 assert.equal(minimumBid({starting_price:100, current_price:'105.50', bid_count:2, bid_increment:'5'}),110.5)
})
test('bid validation rejects invalid precision, insufficient and expired bids', () => {
 const auction={starting_price:100, current_price:100, bid_count:0, bid_increment:1, ends_at:'2026-09-12T12:00:00Z'}
 for(const amount of ['', 'abc', Infinity, -1, '100.001', '1e3']) assert.ok(bidProblem(amount,auction,now))
 assert.ok(bidProblem('99.99',auction,now))
 assert.equal(bidProblem('100.25',auction,now),'')
 assert.ok(bidProblem('150', {...auction,ends_at:'2026-09-11T12:00:00Z'},now))
})
test('login return targets are confined to local artwork and gallery routes', () => {
 assert.equal(safeReturnPath('/gallery/123'),'/gallery/123')
 for(const path of ['https://evil.test','//evil.test','/admin','/login','/\\evil.test',null]) assert.equal(safeReturnPath(path),'/gallery')
})
