export const orderLabels = {
  completed: ['Payment received', 'Thank you. The piece is yours and the artist has been notified.'],
  pending: ['Confirming your payment…', 'This can take a moment. You can safely leave this page open.'],
  failed: ['Payment didn’t go through', 'You haven’t been charged. You can try again from the artwork page.'],
  invalid: ['Payment couldn’t be verified', 'Please contact us with your order reference if you were charged.'],
  reversed: ['Payment reversed', 'This payment was reversed and the piece is available again.'],
}

// What the buyer can do for a piece. Auction winners are checked separately by the server.
export function checkoutMode(art, auction, now = Date.now()) {
  if (!art || art.sold_at) return null
  if (!auction) return Number(art.price) > 0 ? 'purchase' : null
  return Date.parse(auction.ends_at) <= now && Number(auction.bid_count) > 0 ? 'auction' : null
}

export function returnReference(query) {
  const ref = query?.OrderMerchantReference
  return typeof ref === 'string' && /^[0-9a-f-]{36}$/i.test(ref) ? ref : ''
}
