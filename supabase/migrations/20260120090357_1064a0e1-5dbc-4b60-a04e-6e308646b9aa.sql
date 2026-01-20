-- Add image columns to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS content_images JSONB DEFAULT '[]'::JSONB;

COMMENT ON COLUMN public.articles.featured_image_url IS 'URL of the featured/hero image';
COMMENT ON COLUMN public.articles.content_images IS 'Array of {sectionId, imageUrl, altText} for inline images';

-- Create public storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for public read access
CREATE POLICY "Public read access for article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Admin upload policy
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND is_admin());

-- Admin delete policy
CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND is_admin());