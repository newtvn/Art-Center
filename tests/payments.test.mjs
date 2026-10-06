import test from 'node:test'
import assert from 'node:assert/strict'
import { mapPesapalStatus, resolvePayable, verifyStatus, toAmount, describeOrder } from '../supabase/functions/_shared/payments-core.js'
import { checkoutMode, returnReference } from '../src/lib/checkout.js'
const now = Date.parse('2026-10-06T12:00:00Z')
const art = { id: 'a', artist_id: 'artist', price: '1200.50', sold_at: null }
const ended = { ends_at: '2026-10-05T12:00:00Z', bid_count: 3 }
test('Pesapal status codes map to order statuses', () => {
 assert.deepEqual([0, 1, 2, 3, undefined].map(mapPesapalStatus), ['invalid', 'completed', 'failed', 'reversed', 'pending'])
})
test('fixed-price purchase uses the database price and rejects sold, owned or auction pieces', () => {
 assert.deepEqual(resolvePayable({ mode: 'purchase', artwork: art, userId: 'buyer', now }), { kind: 'purchase', amount: 1200.5 })
 assert.equal(resolvePayable({ mode: 'purchase', artwork: { ...art, sold_at: 'x' }, userId: 'buyer' }).status, 409)
 assert.equal(resolvePayable({ mode: 'purchase', artwork: art, userId: 'artist' }).status, 403)
 assert.equal(resolvePayable({ mode: 'purchase', artwork: art, auction: ended, userId: 'buyer' }).status, 409)
 assert.equal(resolvePayable({ mode: 'purchase', artwork: { ...art, price: null }, userId: 'buyer' }).status, 409)
})
test('only the winning bidder can pay once the auction has closed', () => {
 const top = { bidder_id: 'winner', amount: '450.00' }
 assert.deepEqual(resolvePayable({ mode: 'auction', artwork: art, auction: ended, topBid: top, userId: 'winner', now }), { kind: 'auction', amount: 450 })
 assert.equal(resolvePayable({ mode: 'auction', artwork: art, auction: ended, topBid: top, userId: 'other', now }).status, 403)
 assert.equal(resolvePayable({ mode: 'auction', artwork: art, auction: { ...ended, ends_at: '2026-10-07T00:00:00Z' }, topBid: top, userId: 'winner', now }).status, 409)
 assert.equal(resolvePayable({ mode: 'auction', artwork: art, auction: { ...ended, bid_count: 0 }, userId: 'winner', now }).status, 409)
 assert.equal(resolvePayable({ mode: 'nope', artwork: art, userId: 'x' }).status, 400)
})
test('a completed status only counts when amount and currency match the order', () => {
 const order = { amount: '450.00', currency: 'USD' }
 assert.equal(verifyStatus(order, { status_code: 1, amount: 450, currency: 'USD' }).status, 'completed')
 assert.equal(verifyStatus(order, { status_code: 1, amount: 45, currency: 'USD' }).status, 'invalid')
 assert.equal(verifyStatus(order, { status_code: 1, amount: 450, currency: 'KES' }).status, 'invalid')
 assert.equal(verifyStatus(order, { status_code: 2 }).status, 'failed')
 assert.equal(verifyStatus(order, null).status, 'pending')
})
test('amounts and descriptions are normalised', () => {
 assert.equal(toAmount('10.005') === 10.01 || toAmount('10.005') === 10, true)
 for (const v of [0, -1, 'x', null, Infinity]) assert.equal(toAmount(v), null)
 assert.equal(describeOrder('x'.repeat(200)).length, 100)
})
test('client checkout modes and return references', () => {
 assert.equal(checkoutMode(art, null, now), 'purchase')
 assert.equal(checkoutMode({ ...art, sold_at: 'x' }, null, now), null)
 assert.equal(checkoutMode(art, { ends_at: '2026-10-07T00:00:00Z', bid_count: 1 }, now), null)
 assert.equal(checkoutMode(art, ended, now), 'auction')
 assert.equal(returnReference({ OrderMerchantReference: '123e4567-e89b-12d3-a456-426614174000' }), '123e4567-e89b-12d3-a456-426614174000')
 assert.equal(returnReference({ OrderMerchantReference: '../x' }), '')
})
