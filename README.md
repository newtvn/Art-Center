# IMPERIAL | The Art Center

A minimalist art curation platform built with Vue 3, Vite, and Tailwind CSS.

## Project Structure

- **src/views/**: Contains the main pages (Home, Gallery, Artists, ArtDetail).
- **src/components/**: (Empty, logic is within views for simplicity, can be expanded).
- **src/router/**: Routing configuration.
- **src/data.js**: centralized artwork and artist data.
- **src/style.css**: Global styles and Tailwind imports.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Design Notes

- **Typography**: Space Grotesk.
- **Aesthetics**: Glassmorphism, grainy noise textures, rounded "apple" corners.
- **Interactions**: Smooth page transitions, hover states, and a custom wall visualizer.


## Gallery redesign and Supabase setup

The public gallery fetches artwork and artist profiles from Supabase only. No sample images or biographies are substituted when data is unavailable. Configure `.env.local` with `VITE_SUPABASE_URL` and a public `VITE_SUPABASE_ANON_KEY` (publishable keys are supported). Never put a secret/service-role key in a Vite variable.

If the tables do not exist, run `supabase/migrations/202609110001_gallery.sql` in your project's Supabase SQL editor. This creates missing tables, public image storage and owner-scoped writes, adds optional artwork story fields, and does not seed or delete artwork. It is safe to run again. Review any additional policies already present in an existing project; permissive policies combine.

Create an artist account through Supabase Auth, sign in at `/admin/login`, then save the artist profile before uploading artwork. Profile IDs match the authenticated user ID. The gallery reads `artworks` joined to `artists`; category navigation includes uploaded media automatically. Existing `/curators` links remain supported as aliases for `/artists`.

Optional artwork fields: `long_history`, `inspiration_text`, and `origin`. Edit these in the artist ledger’s artwork editor. Artist stories use `artists.long_bio` and `artists.photo`.

An empty collection shows an invitation; connection/schema problems show a retry state. Published artwork can be explored as a perspective card gallery, or placed on a coloured wall with drag, position and size controls. Reduced-motion preferences are respected.

Checks: `node --test tests/*.test.mjs` and `npm run build`.

## Auctions and collector login

Collectors can sign in by email at `/login`. Artists can configure timed auctions in the inventory registry. Before live bidding is available, apply `supabase/migrations/202609110002_auctions.sql` and configure Supabase's email redirect URLs. See [auction setup and verification](docs/auctions.md). Payment integration is deferred.

## Artist ledger

The artist workspace at `/admin/dashboard` now shares the public gallery's visual language. `/admin/login` supports email links for new or existing artists and passwords for existing accounts. Add the production `/admin/login**` callback pattern to Supabase's allowed redirects; the development `/**` patterns documented above already cover it.

The overview and artwork collection fetch only the signed-in artist's records. A new artist creates a profile first, then publishes pieces. Artwork management includes search, medium filters, existing-piece editing, original-image previews, story and inspiration fields, and auction settings. The profile editor previews the portrait, name, medium and story as they are entered. Uploads accept JPG, PNG and WebP up to 10 MB. Save errors retain entered changes for retry. No demonstration profiles, artworks or sales totals are substituted.

Ledger styles live in `src/studio.css`; shared navigation lives in `src/components/studio/ArtistLayout.vue`. Unit and server-rendered UI checks are included in `tests/studio*.test.mjs`.
