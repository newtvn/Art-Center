import { admin, authedUser, cors, json, transactionStatus } from '../_shared/pesapal.ts'
import { verifyStatus } from '../_shared/payments-core.js'

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await authedUser(req)
    if (!user) return json({ error: 'Sign in to view this payment.' }, 401)
    const { orderId } = await req.json().catch(() => ({}))
    if (typeof orderId !== 'string') return json({ error: 'Invalid request.' }, 400)
    const db = admin()
    let { data: order } = await db.from('orders').select('*').eq('id', orderId).eq('buyer_id', user.id).maybeSingle()
    if (!order) return json({ error: 'Order not found.' }, 404)
    if (order.status === 'pending' && order.order_tracking_id) {
      const status = await transactionStatus(order.order_tracking_id)
      const result = verifyStatus(order, status)
      if (result.status !== 'pending') {
        const { data } = await db.rpc('settle_order', { p_order_id: order.id, p_status: result.status, p_tracking_id: order.order_tracking_id, p_method: status.payment_method ?? null, p_confirmation: status.confirmation_code ?? null })
        if (data) order = data
      }
    }
    return json({ orderId: order.id, artworkId: order.artwork_id, status: order.status, amount: order.amount, currency: order.currency })
  } catch (error) {
    console.error('pesapal-verify', error)
    return json({ error: 'We couldn’t confirm the payment yet.' }, 502)
  }
})
