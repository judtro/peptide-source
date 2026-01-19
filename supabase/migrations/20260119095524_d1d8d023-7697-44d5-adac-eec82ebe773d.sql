-- Add discount_percentage column to vendors table
ALTER TABLE public.vendors
ADD COLUMN discount_percentage numeric DEFAULT 0;