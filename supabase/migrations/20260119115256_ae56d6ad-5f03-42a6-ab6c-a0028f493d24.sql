-- Add stock_status column to vendor_products
ALTER TABLE public.vendor_products ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'in_stock';

-- Migrate existing data from in_stock boolean to stock_status
UPDATE public.vendor_products SET stock_status = CASE 
  WHEN in_stock = true THEN 'in_stock'
  WHEN in_stock = false THEN 'out_of_stock'
  ELSE 'in_stock'
END WHERE stock_status IS NULL OR stock_status = 'in_stock';

-- Add check constraint for valid values
ALTER TABLE public.vendor_products ADD CONSTRAINT valid_stock_status 
  CHECK (stock_status IN ('in_stock', 'out_of_stock', 'backorder', 'preorder', 'coming_soon'));