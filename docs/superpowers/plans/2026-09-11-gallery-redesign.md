# Gallery redesign implementation plan

Goal: Deliver the approved Supabase-backed public gallery locally.
Architecture: shared collection state; reusable artwork cards, image and state components; five public pages; responsive CSS and action-led motion. Retain existing admin routes.
Tech stack: Vue 3, Vue Router, Supabase JS, GSAP, Vite.
Spec: docs/superpowers/specs/2026-09-11-gallery-design.md

- [x] Inspect video frames and establish transition choreography.
- [x] Add data utilities and tests for category handling, schema errors, missing optional data, and safe external links. Run `node --test tests/*.test.mjs`.
- [x] Implement shared fetching and empty/error states; rewrite public shell, home composition and category gallery.
- [x] Implement linked artist pages, biography motion, artwork detail and accessible interactive viewer.
- [x] Add rerunnable missing-schema provisioning and setup documentation; align upload category options.
- [x] Run `npm run build`; exercise desktop/mobile, navigation and populated/empty/error states; inspect screenshots and fix defects.

Validation: 5 artworks and 3 artists returned by live Supabase. Desktop browser verified category navigation, linked artist profiles, floating card navigation and wall controls. Mobile styles implemented; browser connection failed before responsive UI inspection could be completed. Server-rendered tests cover loading, empty and missing-schema states. No database mutations performed.
