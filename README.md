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
