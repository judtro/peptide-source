-- 1. Consolidate peptide categories (reduce from 17 to 8)
-- Update existing products to use consolidated categories
UPDATE products SET category = 'Growth Hormone' WHERE category IN ('Growth Factor');
UPDATE products SET category = 'Metabolic' WHERE category IN ('Performance');
UPDATE products SET category = 'Anti-Aging' WHERE category IN ('Cosmetic', 'Cosmetic / Skin', 'Cosmetic / Tanning');
UPDATE products SET category = 'Cognitive' WHERE category IN ('Nootropic', 'Sleep');
UPDATE products SET category = 'Immunity' WHERE category IN ('Immune Support', 'Gut Health');
UPDATE products SET category = 'Hormone' WHERE category IN ('Lifestyle');
UPDATE products SET category = 'Specialty' WHERE category IN ('Ancillary');

-- 2. Create table for article scheduling
CREATE TABLE IF NOT EXISTS public.article_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  target_length TEXT NOT NULL DEFAULT 'standard' CHECK (target_length IN ('short', 'standard', 'long')),
  additional_context TEXT,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_schedules ENABLE ROW LEVEL SECURITY;

-- RLS policies for article_schedules
CREATE POLICY "Admins can view schedules" ON public.article_schedules FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert schedules" ON public.article_schedules FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update schedules" ON public.article_schedules FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete schedules" ON public.article_schedules FOR DELETE USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_article_schedules_updated_at
  BEFORE UPDATE ON public.article_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();