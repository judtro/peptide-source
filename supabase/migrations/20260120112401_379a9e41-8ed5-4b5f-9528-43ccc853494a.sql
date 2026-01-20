-- 1. Create article_translations table for multi-language support
CREATE TABLE public.article_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  summary TEXT,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  table_of_contents JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_auto_translated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, language)
);

-- Enable RLS
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_translations
CREATE POLICY "Anyone can view article translations"
ON public.article_translations
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert article translations"
ON public.article_translations
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update article translations"
ON public.article_translations
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete article translations"
ON public.article_translations
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_article_translations_updated_at
BEFORE UPDATE ON public.article_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add meta_title column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title TEXT;

-- 3. Fix existing articles with missing heading IDs
WITH article_fixes AS (
  SELECT 
    id,
    (
      SELECT jsonb_agg(
        CASE 
          WHEN elem->>'type' = 'heading' AND (elem->>'id' IS NULL OR elem->>'id' = '') THEN
            elem || jsonb_build_object(
              'id', 
              COALESCE(
                (SELECT toc_elem->>'id' 
                 FROM jsonb_array_elements(table_of_contents) toc_elem 
                 WHERE LOWER(TRIM(toc_elem->>'title')) = LOWER(TRIM(elem->>'text'))
                 LIMIT 1),
                LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(elem->>'text', ''), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
              )
            )
          ELSE elem
        END
      )
      FROM jsonb_array_elements(content) elem
    ) as fixed_content
  FROM articles
  WHERE content IS NOT NULL
    AND jsonb_array_length(content) > 0
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(content) elem 
      WHERE elem->>'type' = 'heading' AND (elem->>'id' IS NULL OR elem->>'id' = '')
    )
)
UPDATE articles 
SET content = article_fixes.fixed_content,
    updated_at = now()
FROM article_fixes 
WHERE articles.id = article_fixes.id
  AND article_fixes.fixed_content IS NOT NULL;