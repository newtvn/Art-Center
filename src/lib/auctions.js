export const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(Number(value))
export function countdown(end, now = Date.now()) {
 if (!end || !Number.isFinite(Date.parse(end))) return 'No deadline set'
 const seconds = Math.max(0, Math.ceil((Date.parse(end) - now) / 1000))
 if (!seconds) return 'Auction ended'
 const pad = n => String(n).padStart(2, '0')
 return `${Math.floor(seconds/86400)}d ${pad(Math.floor(seconds/3600)%24)}h ${pad(Math.floor(seconds/60)%60)}m ${pad(seconds%60)}s`
}
export function minimumBid(auction) {
 return Math.round((Number(auction.bid_count) ? Number(auction.current_price) + Number(auction.bid_increment) : Number(auction.starting_price))*100)/100
}
export function bidProblem(amount, auction, now = Date.now()) {
 if (!auction || !Number.isFinite(Date.parse(auction.ends_at)) || Date.parse(auction.ends_at) <= now) return 'This auction has ended.'
 if (!/^\d+(\.\d{1,2})?$/.test(String(amount)) || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || Number(amount) > 9999999999.99) return 'Enter a valid amount with up to two decimal places.'
 if (Number(amount) < minimumBid(auction)) return `Enter ${money(minimumBid(auction))} or more.`
 return ''
}
export function safeReturnPath(value) {
 return typeof value === 'string' && /^\/gallery(?:\/[a-zA-Z0-9-]+)?$/.test(value) ? value : '/gallery'
}
