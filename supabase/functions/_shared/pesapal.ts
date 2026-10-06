import { createClient } from 'npm:@supabase/supabase-js@2'

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const required = (name: string) => {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing secret ${name}`)
  return value
}
const base = () => required('PESAPAL_BASE_URL').replace(/\/$/, '')

export const admin = () => createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'))

export async function authedUser(req: Request) {
  const header = req.headers.get('Authorization') || ''
  const client = createClient(required('SUPABASE_URL'), required('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: header } } })
  const { data, error } = await client.auth.getUser()
  return error || !data.user ? null : data.user
}

async function call(path: string, init: RequestInit = {}) {
  const res = await fetch(`${base()}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(init.headers || {}) }, signal: AbortSignal.timeout(20000) })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body?.error) throw new Error(`Pesapal ${path} failed (${res.status})`)
  return body
}

let token: { value: string; exp: number } | null = null
async function bearer() {
  if (token && token.exp > Date.now() + 30000) return token.value
  const body = await call('/api/Auth/RequestToken', { method: 'POST', body: JSON.stringify({ consumer_key: required('PESAPAL_CONSUMER_KEY'), consumer_secret: required('PESAPAL_CONSUMER_SECRET') }) })
  if (!body.token) throw new Error('Pesapal returned no token')
  token = { value: body.token, exp: Date.parse(body.expiryDate) || Date.now() + 240000 }
  return token.value
}
const authed = async () => ({ Authorization: `Bearer ${await bearer()}` })

let ipnId: string | null = null
export async function ipnIdFor(ipnUrl: string) {
  const fixed = Deno.env.get('PESAPAL_IPN_ID')
  if (fixed) return fixed
  if (ipnId) return ipnId
  const body = await call('/api/URLSetup/RegisterIPN', { method: 'POST', headers: await authed(), body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }) })
  ipnId = body.ipn_id
  return ipnId as string
}

export async function submitOrder(order: Record<string, unknown>) {
  return await call('/api/Transactions/SubmitOrderRequest', { method: 'POST', headers: await authed(), body: JSON.stringify(order) })
}
export async function transactionStatus(trackingId: string) {
  return await call(`/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`, { headers: await authed() })
}
