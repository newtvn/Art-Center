# Pesapal payments

Collectors pay for fixed-price pieces ("Buy now") and for auctions they have won ("Pay for your win"). Amounts are charged in **USD**. After a confirmed payment the artwork gets `sold_at`, shows a "Sold" badge and can no longer be bought or bid on.

## How it works
1. `pesapal-create-order` (signed-in, verified email) re-reads the price/winning bid from the database, calls `reserve_order` (30-minute hold, one buyer at a time) and returns Pesapal's `redirectUrl`.
2. The collector pays on Pesapal and returns to `/checkout/return`.
3. `pesapal-ipn` (called by Pesapal) and `pesapal-verify` (called by the return page) re-fetch the status from Pesapal, check amount and currency against the stored order, and call `settle_order`. The client is never trusted for status.

If a payment completes after the hold expired and another buyer already paid, the order is stored with `needs_refund = true` for manual refund.

## Setup
1. Apply `supabase/migrations/202610060001_payments.sql`.
2. Set secrets (never in a `VITE_` variable or the repo):
   ```
   supabase secrets set PESAPAL_CONSUMER_KEY=... PESAPAL_CONSUMER_SECRET='...' \
     PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3 SITE_URL=https://art-center.vercel.app
   ```
   Live: `PESAPAL_BASE_URL=https://pay.pesapal.com/v3` with the keys from your approved merchant dashboard. Optionally set `PESAPAL_IPN_ID` to reuse a registered IPN; otherwise the function registers its IPN URL on first use.
3. Deploy:
   ```
   supabase functions deploy pesapal-create-order
   supabase functions deploy pesapal-verify
   supabase functions deploy pesapal-ipn --no-verify-jwt
   ```
   The IPN function must skip JWT verification because Pesapal calls it directly.

## Testing
`node --test tests/*.test.mjs` (set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to any values for the SSR tests) covers pricing, winner checks, status mapping and amount verification. Run an end-to-end sandbox payment after deploying.
