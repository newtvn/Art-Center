# Furnished room visualizer

User-approved change: replace the plain wall with a photographed living room and staircase. Keep artwork from Supabase. Allow scene selection, wall paint changes, frame selection, sizing and placement.

- Generate two local photo backgrounds with clear hanging walls; inspect composition.
- Define per-scene wall masks and placement bounds so paint affects plaster only and art remains above furniture/stairs.
- Extract WallVisualizer from GalleryRoom. Use a responsive scene canvas, thumbnail scene controls, named paint swatches, custom colour, framing, and reset.
- Verify placement bounds with unit tests, component rendering, production build and available browser review.

Assets are generated interiors only, never replacement artwork. Colour preview preserves photo shading with a masked multiply layer. It is a visual approximation, not calibrated paint matching or physical AR.
