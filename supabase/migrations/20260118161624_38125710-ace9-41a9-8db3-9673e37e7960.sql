-- Create vendor_products table for per-product pricing
CREATE TABLE public.vendor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price DECIMAL(10,2),
  price_per_mg DECIMAL(10,4),
  size_mg INTEGER,
  in_stock BOOLEAN DEFAULT true,
  source_url TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vendor_id, product_name, size_mg)
);

-- Enable RLS
ALTER TABLE public.vendor_products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view vendor products"
  ON public.vendor_products FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admins can insert vendor products"
  ON public.vendor_products FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update vendor products"
  ON public.vendor_products FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete vendor products"
  ON public.vendor_products FOR DELETE
  USING (public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_vendor_products_updated_at
  BEFORE UPDATE ON public.vendor_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();