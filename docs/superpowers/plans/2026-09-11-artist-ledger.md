# Artist ledger redesign implementation plan

Goal: rebuild the artist workspace in the public gallery's approved Space Grotesk, white, black and muted olive visual language, with working owner-scoped data and complete editing flows.

Architecture: shared ArtistLayout navigation and workspace composable; focused overview, artwork editor, profile editor and login pages. Supabase remains the source of truth. No new packages, sample production content or remote schema changes.

Design: large editorial headings, restrained dividers, artwork in its original colours, generous space, explicit field labels and mobile navigation. Preserve existing public gallery, auction and room visualizer changes. Use PaintLoader and the existing global paint transition. Respect reduced motion.

- [x] Test owner-scoped fetching, upload validation, artwork payloads, profile completeness and login return paths.
- [x] Implement src/lib/studio.js and src/composables/useArtistWorkspace.js with user-specific profile/artwork fetching, clear error/retry states and stale-request protection.
- [x] Build ArtistLayout.vue and studio.css: persistent page navigation, account identity, gallery shortcut, sign-out, desktop side rail and compact mobile header.
- [x] Rebuild AdminDashboard.vue: personal greeting, owned-work summary, live-auction summary, profile checklist, selected works and actionable empty state. Never substitute another profile or fictional financial metrics.
- [x] Rebuild ArtManager.vue with search, media filters, original-colour thumbnails and create/edit actions. Extract ArtworkEditor.vue for image preview, details, story, validation, owner-scoped save and associated AuctionSettings.
- [x] Rebuild ProfileEditor.vue with portrait upload, name, medium, biography, links, public-profile preview and clear save/error states.
- [x] Rebuild AdminLogin.vue with email-link and password options, callback handling and direct access for an existing session. Guard protected admin routes.
- [x] Run unit/render tests, build, diff checks and browser checks where connected access is available. Document any external setup or verification limits.

Validation: node --test tests/*.test.mjs; npm run build; git diff --check. Test Supabase requests through injected fixtures without modifying production data. Preserve current uncommitted work; no automated commit or deployment.

Verification: all 32 node tests passed; production build passed; git diff --check passed. The signed-in dashboard was verified through Chrome’s accessibility tree. Full screenshot verification was unavailable because the native capture service reported an audio/video capture failure. No production artwork/profile data was written during verification.
