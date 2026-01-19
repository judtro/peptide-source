-- Create article_categories table for dynamic category management
CREATE TABLE public.article_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    value TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed with existing categories
INSERT INTO public.article_categories (value, label) VALUES
    ('safety', 'Safety'),
    ('handling', 'Handling'),
    ('pharmacokinetics', 'Pharmacokinetics'),
    ('verification', 'Verification'),
    ('sourcing', 'Sourcing');

-- Enable RLS
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view categories" ON public.article_categories
    FOR SELECT USING (true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert categories" ON public.article_categories
    FOR INSERT WITH CHECK (is_admin());

-- Only admins can update categories
CREATE POLICY "Admins can update categories" ON public.article_categories
    FOR UPDATE USING (is_admin());

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories" ON public.article_categories
    FOR DELETE USING (is_admin());