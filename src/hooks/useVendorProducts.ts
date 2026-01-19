import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VendorProductWithVendor, VendorStatus, StockStatus } from '@/types';

// Product name aliases for matching vendor products to canonical names
const PRODUCT_ALIASES: Record<string, string[]> = {
  'retatrutide': ['glp3', 'glp-3', 'glp 3', 'triple g', 'triple-g', 'ly3437943', 'triple agonist', 'reta'],
  'melanotan 2': ['melanotan ii', 'melanotan-2', 'mt-2', 'mt2', 'mt 2', 'mt-ii'],
  'semaglutide': ['sema', 'glp-1', 'ozempic', 'wegovy'],
  'tirzepatide': ['tirz', 'mounjaro', 'gip/glp-1'],
  'bpc-157': ['bpc 157', 'bpc157', 'body protection compound'],
  'tb-500': ['tb500', 'tb 500', 'thymosin beta-4', 'thymosin beta 4'],
  'pt-141': ['pt141', 'pt 141', 'bremelanotide'],
  'ghk-cu': ['ghk cu', 'ghkcu', 'copper peptide', 'ghk copper'],
  'cjc-1295': ['cjc1295', 'cjc 1295'],
  'ipamorelin': ['ipam', 'ipa'],
  'epithalon': ['epitalon', 'epitalone'],
};

// Get all search terms for a product (canonical name + all aliases)
function getSearchTerms(productName: string): string[] {
  const normalized = productName.toLowerCase().trim()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ');
  
  const terms = new Set<string>([normalized, productName.toLowerCase().trim()]);
  
  // Check if this product has aliases
  for (const [canonical, aliases] of Object.entries(PRODUCT_ALIASES)) {
    const canonicalNormalized = canonical.replace(/[-_]/g, ' ');
    
    // If input matches canonical or any alias, add all terms
    if (normalized === canonicalNormalized || 
        normalized.includes(canonicalNormalized) ||
        aliases.some(a => normalized === a || normalized.includes(a))) {
      terms.add(canonical);
      terms.add(canonicalNormalized);
      aliases.forEach(a => terms.add(a));
      break;
    }
  }
  
  return [...terms];
}

// Normalize product name for filtering
function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s*\d+\s*(mg|mcg|ml|iu)$/i, '') // Remove size suffix
    .replace(/\bii\b/gi, '2')
    .replace(/\biii\b/gi, '3')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface DbVendorProductWithVendor {
  id: string;
  vendor_id: string;
  product_id: string | null;
  product_name: string;
  price: number | null;
  price_per_mg: number | null;
  size_mg: number | null;
  in_stock: boolean | null;
  stock_status: string | null;
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
  stockStatus: (item.stock_status as StockStatus) || 'in_stock',
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
          stock_status,
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
      // Get all search terms including aliases
      const searchTerms = getSearchTerms(productName);
      
      // Build OR filter for all search terms
      const orConditions = searchTerms
        .map(term => `product_name.ilike.%${term}%`)
        .join(',');

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
          stock_status,
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
        .or(orConditions)
        .in('vendors.status', ['verified', 'pending'])
        .order('price_per_mg', { ascending: true });

      if (error) throw error;
      
      const transformed = (data || []).map((item) => transformVendorProduct(item as unknown as DbVendorProductWithVendor));
      
      // Get the normalized base name and all its aliases for filtering
      const normalizedSearch = normalizeProductName(productName);
      const allValidTerms = searchTerms.map(t => normalizeProductName(t));
      
      return transformed.filter((item) => {
        const normalizedItemName = normalizeProductName(item.productName);
        
        // Check if item matches any of our valid search terms
        const matchesTerm = allValidTerms.some(term => {
          if (normalizedItemName === term) return true;
          if (normalizedItemName.startsWith(term)) return true;
          // Also check base alphanumeric match
          const baseItem = normalizedItemName.replace(/[^a-z0-9]/g, '');
          const baseTerm = term.replace(/[^a-z0-9]/g, '');
          if (baseItem.startsWith(baseTerm)) return true;
          return false;
        });
        
        if (!matchesTerm) return false;
        
        // Reject combo products
        const nameLower = item.productName.toLowerCase();
        if (/[&\/]/.test(nameLower) || /\band\b|\bmix\b|\bblend\b|\bcombo\b/.test(nameLower)) {
          return false;
        }
        
        return true;
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
