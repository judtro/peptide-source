import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VendorProductWithVendor, VendorStatus } from '@/types';

interface DbVendorProductWithVendor {
  id: string;
  vendor_id: string;
  product_id: string | null;
  product_name: string;
  price: number | null;
  price_per_mg: number | null;
  size_mg: number | null;
  in_stock: boolean | null;
  source_url: string | null;
  vendors: {
    id: string;
    name: string;
    slug: string;
    discount_code: string | null;
    discount_percentage: number | null;
    website: string | null;
    status: string;
  };
}

const transformVendorProduct = (item: DbVendorProductWithVendor): VendorProductWithVendor => ({
  id: item.id,
  vendorId: item.vendor_id,
  productId: item.product_id || '',
  productName: item.product_name,
  price: Number(item.price) || 0,
  pricePerMg: Number(item.price_per_mg) || 0,
  sizeMg: Number(item.size_mg) || 0,
  inStock: item.in_stock ?? true,
  sourceUrl: item.source_url || undefined,
  vendorName: item.vendors.name,
  vendorSlug: item.vendors.slug,
  discountCode: item.vendors.discount_code || undefined,
  discountPercentage: Number(item.vendors.discount_percentage) || 0,
  website: item.vendors.website || undefined,
  status: item.vendors.status as VendorStatus,
});

export const useVendorProductsByProduct = (productId: string) => {
  return useQuery({
    queryKey: ['vendor-products', 'product', productId],
    queryFn: async (): Promise<VendorProductWithVendor[]> => {
      const { data, error } = await supabase
        .from('vendor_products')
        .select(`
          id,
          vendor_id,
          product_id,
          product_name,
          price,
          price_per_mg,
          size_mg,
          in_stock,
          source_url,
          vendors!inner (
            id,
            name,
            slug,
            discount_code,
            discount_percentage,
            website,
            status
          )
        `)
        .eq('product_id', productId)
        .in('vendors.status', ['verified', 'pending'])
        .order('price_per_mg', { ascending: true });

      if (error) throw error;
      return (data || []).map((item) => transformVendorProduct(item as unknown as DbVendorProductWithVendor));
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useVendorProductsByProductName = (productName: string) => {
  return useQuery({
    queryKey: ['vendor-products', 'product-name', productName],
    queryFn: async (): Promise<VendorProductWithVendor[]> => {
      const { data, error } = await supabase
        .from('vendor_products')
        .select(`
          id,
          vendor_id,
          product_id,
          product_name,
          price,
          price_per_mg,
          size_mg,
          in_stock,
          source_url,
          vendors!inner (
            id,
            name,
            slug,
            discount_code,
            discount_percentage,
            website,
            status
          )
        `)
        .ilike('product_name', `%${productName}%`)
        .in('vendors.status', ['verified', 'pending'])
        .order('price_per_mg', { ascending: true });

      if (error) throw error;
      
      const transformed = (data || []).map((item) => transformVendorProduct(item as unknown as DbVendorProductWithVendor));
      
      // Filter to exclude combo products - only match exact product or same product with size indicator
      const searchLower = productName.toLowerCase().trim();
      
      return transformed.filter((item) => {
        const nameLower = item.productName.toLowerCase().trim();
        
        // Exact match
        if (nameLower === searchLower) return true;
        
        // Check if product name starts with search term followed by size (e.g., "BPC-157 5mg")
        if (nameLower.startsWith(searchLower)) {
          const remainder = nameLower.slice(searchLower.length).trim();
          // Allow if remainder is just a size like "5mg", "10mg", etc.
          if (/^\d+\s*(mg|mcg)?$/i.test(remainder)) return true;
        }
        
        // Reject combo products (contains &, /, "and", "mix", "blend", or parentheses with other compounds)
        if (/[&\/]/.test(nameLower) || /\band\b|\bmix\b|\bblend\b|\bcombo\b/.test(nameLower)) {
          return false;
        }
        
        // If it's just the product name with no modifiers, allow it
        return nameLower === searchLower;
      });
    },
    enabled: !!productName,
    staleTime: 5 * 60 * 1000,
  });
};

// Calculate the discounted price per mg
export const calculateDiscountedPrice = (pricePerMg: number, discountPercentage?: number): number => {
  if (!discountPercentage || discountPercentage <= 0) return pricePerMg;
  return pricePerMg * (1 - discountPercentage / 100);
};
