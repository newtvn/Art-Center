# Art Center gallery redesign

Approved direction: rebuild the public gallery to match the user's white, black-type, staggered-image reference. Keep all artwork sourced from Supabase; do not introduce demonstration artworks or artist biographies. Supabase may be empty or missing its schema, and both states must remain usable.

Use Space Grotesk, white (#ffffff), black (#000000), secondary text (#666666), muted frames (#f3f3f1), and dividers (#e6e6e6). Desktop hero is an asymmetric five-column composition with its headline in the upper left and art climbing toward the upper right. Mobile uses a readable headline and two artwork columns. Original artwork colours are preserved.

Navigation is an accessible hamburger disclosure with Gallery, categories, Artists, and Artist sign-in. Category URLs preserve filtering. Public artwork and artist details remain deep-linkable; existing curator URLs continue working. Artist names and portraits link to their profiles. Artwork detail includes a full-image viewer and interactive wall placement. Motion follows the supplied video where feasible, with reduced-motion alternatives.

A shared Supabase collection composable provides loading, empty, error and retry behavior without stock-image fallbacks. A rerunnable SQL provisioning script provides missing tables and image storage without deleting or seeding art. Keep privileged keys out of browser configuration. Do not execute a remote migration without database access.

Validation: production build; node data tests; browser checks with isolated response fixtures for populated galleries, empty/error states, filters, artist links, viewers, menu keyboard behavior, and mobile overflow. Fixtures never enter production data.
