-- 1. Remove the strict link to auth.users so we can add "dummy" artists
ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_id_fkey;

-- 2. Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Seed Artists
INSERT INTO artists (id, name, photo, specialty, long_bio, socials)
VALUES 
    (uuid_generate_v4(), 'Elias Thorne', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400', 'Brutalist Sculpture', 'Elias Thorne has spent two decades exploring the relationship between raw concrete and the fragility of human memory. His work is held in permanent collections across Zurich and Tokyo.', '{"instagram": "https://instagram.com", "website": "https://eliasthorne.com"}'::jsonb),
    (uuid_generate_v4(), 'Sola Jung', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400', 'Light Installation', 'Jung uses refractive glass and LED arrays to create spaces that breathe. Her work is often described as "architecture for the soul," focusing on the void between objects.', '{"instagram": "https://instagram.com", "website": "https://solajung.studio"}'::jsonb);

-- 4. Seed Artworks (linked by name)
INSERT INTO artworks (artist_id, title, category, price, dimensions, year, image)
SELECT id, 'Void Study 01', 'Sculpture', 4200, '32 x 32 x 80 inches', '2023', 'https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=1200'
FROM artists WHERE name = 'Elias Thorne';

INSERT INTO artworks (artist_id, title, category, price, dimensions, year, image)
SELECT id, 'Monolith II', 'Sculpture', 5500, '12 x 12 x 40 inches', '2024', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1200'
FROM artists WHERE name = 'Elias Thorne';

INSERT INTO artworks (artist_id, title, category, price, dimensions, year, image)
SELECT id, 'Prism Horizon', 'Photography', 3800, '60 x 40 inches', '2023', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200'
FROM artists WHERE name = 'Sola Jung';

INSERT INTO artworks (artist_id, title, category, price, dimensions, year, image)
SELECT id, 'Ether Canvas', 'Canvas', 2100, '48 x 48 inches', '2025', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200'
FROM artists WHERE name = 'Sola Jung';
