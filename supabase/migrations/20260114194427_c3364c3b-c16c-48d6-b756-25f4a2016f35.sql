-- Create app_role enum for admin roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin authentication
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create vendors table
CREATE TABLE public.vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    region TEXT NOT NULL DEFAULT 'US',
    shipping_regions TEXT[] DEFAULT ARRAY['US']::TEXT[],
    purity_score NUMERIC(5,2) DEFAULT 0,
    coa_verified BOOLEAN DEFAULT false,
    price_per_mg NUMERIC(10,4) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    website TEXT,
    peptides TEXT[] DEFAULT ARRAY[]::TEXT[],
    last_verified TIMESTAMP WITH TIME ZONE,
    discount_code TEXT,
    description TEXT,
    location TEXT,
    year_founded TEXT,
    shipping_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
    payment_methods TEXT[] DEFAULT ARRAY[]::TEXT[],
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    molecular_weight TEXT,
    purity_standard TEXT,
    sequence TEXT,
    synonyms TEXT[] DEFAULT ARRAY[]::TEXT[],
    half_life TEXT,
    is_popular BOOLEAN DEFAULT false,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    category TEXT NOT NULL,
    category_label TEXT,
    read_time INTEGER DEFAULT 5,
    published_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    author_name TEXT,
    author_role TEXT,
    table_of_contents JSONB DEFAULT '[]'::JSONB,
    content JSONB DEFAULT '[]'::JSONB,
    citations JSONB DEFAULT '[]'::JSONB,
    related_peptides TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create batches table for COA/audit records
CREATE TABLE public.batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT NOT NULL,
    vendor_id uuid REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    test_date DATE NOT NULL,
    purity_result NUMERIC(5,2) NOT NULL,
    report_url TEXT,
    lab_name TEXT,
    test_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Create helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles (users can only view their own roles)
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for vendors
CREATE POLICY "Anyone can view vendors"
    ON public.vendors
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert vendors"
    ON public.vendors
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update vendors"
    ON public.vendors
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete vendors"
    ON public.vendors
    FOR DELETE
    USING (public.is_admin());

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
    ON public.products
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    USING (public.is_admin());

-- RLS Policies for articles
CREATE POLICY "Anyone can view articles"
    ON public.articles
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert articles"
    ON public.articles
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update articles"
    ON public.articles
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete articles"
    ON public.articles
    FOR DELETE
    USING (public.is_admin());

-- RLS Policies for batches
CREATE POLICY "Anyone can view batches"
    ON public.batches
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can insert batches"
    ON public.batches
    FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update batches"
    ON public.batches
    FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can delete batches"
    ON public.batches
    FOR DELETE
    USING (public.is_admin());

-- Create storage bucket for COA reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('coa-reports', 'coa-reports', true);

-- Storage policies for coa-reports bucket
CREATE POLICY "Anyone can view COA reports"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'coa-reports');

CREATE POLICY "Admins can upload COA reports"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'coa-reports' AND public.is_admin());

CREATE POLICY "Admins can update COA reports"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'coa-reports' AND public.is_admin());

CREATE POLICY "Admins can delete COA reports"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'coa-reports' AND public.is_admin());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();