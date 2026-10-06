// Deploy with --no-verify-jwt: Pesapal calls this URL directly. Nothing in the request is trusted;
// the status is always re-fetched from Pesapal and the amount checked against the stored order.
import { admin, json, transactionStatus } from '../_shared/pesapal.ts'
import { verifyStatus } from '../_shared/payments-core.js'

Deno.serve(async req => {
  const url = new URL(req.url)
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
  const trackingId = url.searchParams.get('OrderTrackingId') || body.OrderTrackingId
  const reference = url.searchParams.get('OrderMerchantReference') || body.OrderMerchantReference
  const type = url.searchParams.get('OrderNotificationType') || body.OrderNotificationType || 'IPNCHANGE'
  const reply = (status: number) => json({ orderNotificationType: type, orderTrackingId: trackingId, orderMerchantReference: reference, status })
  if (!trackingId || !reference) return reply(500)
  try {
    const db = admin()
    const { data: order } = await db.from('orders').select('*').eq('id', reference).maybeSingle()
    if (!order || (order.order_tracking_id && order.order_tracking_id !== trackingId)) return reply(500)
    const status = await transactionStatus(trackingId)
    const result = verifyStatus(order, status)
    const { error } = await db.rpc('settle_order', { p_order_id: order.id, p_status: result.status, p_tracking_id: trackingId, p_method: status.payment_method ?? null, p_confirmation: status.confirmation_code ?? null })
    return reply(error ? 500 : 200)
  } catch (error) {
    console.error('pesapal-ipn', error)
    return reply(500)
  }
})
