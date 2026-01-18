-- Make COA reports bucket private
UPDATE storage.buckets SET public = false WHERE id = 'coa-reports';

-- Drop the public read policy
DROP POLICY IF EXISTS "Anyone can view COA reports" ON storage.objects;