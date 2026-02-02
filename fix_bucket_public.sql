-- Update the storage bucket to be explicitly public
-- This allows getPublicUrl() links to work for unauthenticated users
UPDATE storage.buckets
SET public = true
WHERE id = 'art-center-assets';

-- Ensure the policy allows public select (re-applying/verifying)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'art-center-assets' );
