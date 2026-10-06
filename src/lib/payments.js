import { supabase } from './supabaseClient'

export async function startCheckout(artworkId, mode) {
  const { data, error } = await supabase.functions.invoke('pesapal-create-order', { body: { artworkId, mode } })
  if (error) {
    const detail = await error.context?.json?.().catch(() => null)
    throw new Error(detail?.error || 'We couldn’t start the payment. Please try again.')
  }
  if (!data?.redirectUrl || !/^https:\/\/(pay|cybqa)\.pesapal\.com\//.test(data.redirectUrl)) throw new Error('We couldn’t start the payment. Please try again.')
  return data
}

export async function verifyOrder(orderId) {
  const { data, error } = await supabase.functions.invoke('pesapal-verify', { body: { orderId } })
  if (error) throw new Error('We couldn’t confirm the payment yet.')
  return data
}

// The signed-in collector's own top bid (RLS hides everyone else's).
export async function myTopBid(artworkId) {
  const { data } = await supabase.from('bids').select('amount').eq('artwork_id', artworkId).order('amount', { ascending: false }).limit(1).maybeSingle()
  return data ? Number(data.amount) : null
}
