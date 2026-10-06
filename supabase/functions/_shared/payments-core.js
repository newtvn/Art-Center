// Pure payment rules shared by the Edge Functions (Deno) and the Node test suite.
export const CURRENCY = 'USD'

// Pesapal GetTransactionStatus status_code: 0 invalid, 1 completed, 2 failed, 3 reversed.
export function mapPesapalStatus(code) {
  return { 0: 'invalid', 1: 'completed', 2: 'failed', 3: 'reversed' }[Number(code)] || 'pending'
}

export function toAmount(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= 9999999999.99 ? Math.round(n * 100) / 100 : null
}

// Decides what a buyer owes. Returns {kind, amount} or {error, status}.
export function resolvePayable({ mode, artwork, auction, topBid, userId, now = Date.now() }) {
  if (!artwork) return { error: 'Artwork not found.', status: 404 }
  if (artwork.sold_at) return { error: 'This piece has already been sold.', status: 409 }
  if (artwork.artist_id === userId) return { error: 'You cannot buy your own artwork.', status: 403 }
  if (mode === 'purchase') {
    if (auction) return { error: 'This piece is sold by auction.', status: 409 }
    const amount = toAmount(artwork.price)
    return amount ? { kind: 'purchase', amount } : { error: 'This piece has no fixed price.', status: 409 }
  }
  if (mode === 'auction') {
    if (!auction) return { error: 'This piece is not an auction.', status: 409 }
    if (Date.parse(auction.ends_at) > now) return { error: 'The auction is still open.', status: 409 }
    if (!Number(auction.bid_count) || !topBid) return { error: 'The auction closed without bids.', status: 409 }
    if (topBid.bidder_id !== userId) return { error: 'Only the winning bidder can pay for this piece.', status: 403 }
    const amount = toAmount(topBid.amount)
    return amount ? { kind: 'auction', amount } : { error: 'Invalid winning amount.', status: 409 }
  }
  return { error: 'Unknown payment mode.', status: 400 }
}

// A verified status only counts when the amount and currency Pesapal reports match the order.
export function verifyStatus(order, status) {
  const mapped = mapPesapalStatus(status?.status_code)
  if (mapped !== 'completed') return { status: mapped }
  const paid = Number(status.amount)
  if (!Number.isFinite(paid) || Math.abs(paid - Number(order.amount)) > 0.005 || String(status.currency || '').toUpperCase() !== order.currency) {
    return { status: 'invalid' }
  }
  return { status: 'completed' }
}

export function describeOrder(title) {
  return `Art Center: ${String(title || 'Artwork')}`.slice(0, 100)
}

export function safeOrigin(value, fallback) {
  try { const u = new URL(value); return u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1' ? u.origin : fallback } catch { return fallback }
}
