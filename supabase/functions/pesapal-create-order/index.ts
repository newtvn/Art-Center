import { admin, authedUser, cors, ipnIdFor, json, submitOrder } from '../_shared/pesapal.ts'
import { CURRENCY, describeOrder, resolvePayable, safeOrigin } from '../_shared/payments-core.js'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)
  try {
    const user = await authedUser(req)
    if (!user || !user.email || !user.email_confirmed_at) return json({ error: 'Sign in with a verified email to pay.' }, 401)
    const { artworkId, mode } = await req.json().catch(() => ({}))
    if (typeof artworkId !== 'string' || !['purchase', 'auction'].includes(mode)) return json({ error: 'Invalid request.' }, 400)

    const db = admin()
    const [{ data: artwork }, { data: auction }, { data: topBid }] = await Promise.all([
      db.from('artworks').select('id,title,artist_id,price,sold_at').eq('id', artworkId).maybeSingle(),
      db.from('auctions').select('*').eq('artwork_id', artworkId).maybeSingle(),
      db.from('bids').select('bidder_id,amount').eq('artwork_id', artworkId).order('amount', { ascending: false }).limit(1).maybeSingle(),
    ])
    const payable = resolvePayable({ mode, artwork, auction, topBid, userId: user.id })
    if (payable.error) return json({ error: payable.error }, payable.status)

    const { data: order, error } = await db.rpc('reserve_order', { p_artwork_id: artworkId, p_buyer_id: user.id, p_kind: payable.kind, p_amount: payable.amount })
    if (error) return json({ error: error.message }, error.code === 'P0001' ? 409 : 500)

    const site = Deno.env.get('SITE_URL') || 'https://art-center.vercel.app'
    const origin = safeOrigin(req.headers.get('origin') || '', site)
    const allowed = [site, 'http://localhost:5173', 'http://127.0.0.1:5173']
    const returnOrigin = allowed.includes(origin) ? origin : site
    const ipnUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/pesapal-ipn`
    const submitted = await submitOrder({
      id: order.id, currency: CURRENCY, amount: Number(order.amount), description: describeOrder(artwork.title),
      callback_url: `${returnOrigin}/checkout/return`, cancellation_url: `${returnOrigin}/gallery/${artworkId}`,
      notification_id: await ipnIdFor(ipnUrl), billing_address: { email_address: user.email },
    })
    await db.from('orders').update({ order_tracking_id: submitted.order_tracking_id }).eq('id', order.id)
    return json({ orderId: order.id, redirectUrl: submitted.redirect_url })
  } catch (error) {
    console.error('pesapal-create-order', error)
    return json({ error: 'We couldn’t start the payment. Please try again.' }, 502)
  }
})
