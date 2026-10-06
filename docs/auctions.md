# Auctions and collector sign-in

## Enable in Supabase

1. Apply `supabase/migrations/202609110002_auctions.sql` in the connected project's SQL editor after the gallery migration. It adds auctions, private bid history, and two authenticated database functions. No existing pieces are put up for auction automatically.
2. Enable Email authentication and allow new users in Supabase Auth. In Authentication → URL Configuration, set Site URL to `https://art-center.vercel.app` and allow the login callback URLs, including `http://127.0.0.1:5173/**` and `http://localhost:5173/**` for development, plus `https://art-center.vercel.app/login**` (to allow the return-path query parameter). Also allow `https://art-center.vercel.app/admin/login**` for artist sign-in. Keep the email magic-link template using `{{ .ConfirmationURL }}`. Configure production email delivery before launch.
3. Sign in to the artist space, open **Your artwork**, select an existing piece, and choose **Set up auction** beneath its editor. Set a starting price, minimum increment, and closing date/time. Uploaded pieces use the same control after saving.
4. Collectors use **Sign in to bid**, receive a Supabase email link, and return to the original piece. No password or payment details are collected by this UI. No payment integration has been added.

Email links use Supabase's [signInWithOtp](https://supabase.com/docs/reference/javascript/auth-signinwithotp). Existing artist email/password login remains available.

## Auction behavior

All amounts are USD with two decimal places. First bids may equal the starting price; later bids must meet the current price plus the minimum increment. The deadline is fixed: bidding does not extend it. Auction terms become immutable once a bid is accepted. Dates display in the viewer's time zone. The clock updates each second and prices refresh every ten seconds while the tab is visible, plus after a bid submission. The database clock determines whether a bid is on time.

`place_bid` locks the auction row, validates confirmed email, ownership, deadline, precision and minimum amount, then inserts the private bid and updates the public summary atomically. Clients cannot directly insert bids or edit summaries. Collectors can read only their own bid records; public summaries expose no bidder identity. A recorded bid does not charge the bidder or trigger checkout. Winner notification and payment settlement are future work.

If the migration has not been applied or the connection fails, bidding displays an unavailable state instead of inventing prices or accepting local-only bids.

## Verification

Run `node --test tests/*.test.mjs` and `npm run build`.

For database checks, create an **empty disposable PostgreSQL database**. `tests/fixtures/auction-db.sql` creates minimal fake Auth/artwork tables and local users; never run that fixture against Supabase or a database with real data. Apply the fixture, then the auction migration, then `tests/auction-security.sql` with `psql -v ON_ERROR_STOP=1`. The security test rolls back its changes. It covers anonymous and unverified callers, artist ownership, direct-write denial, precision, minimum increments, bidder privacy, locked terms, expiration and consistent totals.

Local validation also submitted equal bids from two separate PostgreSQL sessions: the first was accepted; the second waited for the lock, then was rejected at the new minimum. One bid and one summary increment remained.

## Paint motion

A shared six-stroke overlay covers and reveals route changes. Loading screens use a small painted stroke and brush. Both respect `prefers-reduced-motion`. Transitions use transform animations, do not intercept pointer events, and clean up on unmount. Existing room visualizer work is preserved.

## Repairing an older database

If artwork publishing returns HTTP 400 because `origin`, `long_history` or `inspiration_text` is missing, and auctions return HTTP 404, run `supabase/migrations/202609120001_complete_artwork_schema.sql` in the existing project's SQL Editor. It adds the three artwork fields and installs auction support without removing artwork. The script is rerunnable; it was validated twice against an isolated database followed by the auction security checks.

The editor now checks schema availability before uploading an image, preserves textual drafts and uploaded image URLs in session storage scoped to artist and artwork, and distinguishes setup problems from connection errors. Local image files still need to be reselected after a full browser reload if they have not been uploaded. Auction polling stops on missing-schema errors until an explicit retry or reload; temporary network failures use bounded backoff.


## Email sign-in and sign-up

Both `/login` (collectors) and `/admin/login` (artists) use the same verified email flow for existing and new accounts. Production emails always return to the canonical `https://art-center.vercel.app` host, even when requested from a preview deployment; explicit local development uses the local origin. Artist returns are limited to the supported studio routes and collector returns to gallery pages. Supabase must allow both production callback patterns including their `next` query strings. An unapproved callback can fall back to the backend Site URL, so leaving that at `http://localhost:3000` breaks live email links. Request a fresh email after changing these settings; existing emails retain their original destinations.

Ensure Email authentication and new-user signup are enabled. Confirm both the Magic Link and Confirm Signup email templates use `{{ .ConfirmationURL }}`. The default Supabase email service is limited to authorized organization addresses; public customer signup requires a configured custom SMTP service. Rate limits and expired/used email links show actionable feedback in the app.
