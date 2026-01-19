import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { VendorProductWithVendor, VendorStatus, StockStatus } from '@/types';

// Product name aliases for matching vendor products to canonical names
const PRODUCT_ALIASES: Record<string, string[]> = {
  // Metabolic / Weight Loss
  'retatrutide': ['glp3', 'glp-3', 'glp 3', 'triple g', 'triple-g', 'ly3437943', 'triple agonist', 'reta'],
  'semaglutide': ['sema', 'glp-1', 'glp 1', 'ozempic', 'wegovy', 'rybelsus'],
  'tirzepatide': ['tirz', 'mounjaro', 'gip/glp-1', 'zepbound', 'gip glp-1'],
  'cagrilintide': ['cagri', 'nn9838', 'cagri peptide'],
  'aod-9604': ['aod9604', 'aod 9604', 'aod9604 peptide'],
  'hgh fragment 176-191': ['fragment 176-191', 'frag 176-191', 'hgh fragment', 'hgh frag', 'fragment 176 191', 'frag 176 191', 'aod 9604', '176-191'],
  '5-amino-1mq': ['5amino1mq', '5 amino 1mq', '5-amino 1mq', 'amino 1mq', '5amino'],
  'aicar': ['acadesine', 'aica ribonucleotide'],
  'mots-c': ['motsc', 'mots c', 'mots-c peptide', 'mitochondrial peptide'],
  'slu-pp-332': ['slupp332', 'slu pp 332', 'slu-pp332', 'exercise mimetic'],
  
  // Tanning / Sexual Health
  'melanotan 2': ['melanotan ii', 'melanotan-2', 'mt-2', 'mt2', 'mt 2', 'mt-ii', 'melanotan-ii'],
  'pt-141': ['pt141', 'pt 141', 'bremelanotide'],
  'kisspeptin': ['kiss-1', 'kiss1', 'kisspeptin-10', 'kp-10'],
  'oxytocin': ['oxt', 'pitocin', 'oxytocin peptide'],
  
  // Recovery / Healing
  'bpc-157': ['bpc 157', 'bpc157', 'body protection compound', 'bepecin', 'pl 14736', 'pl14736'],
  'tb-500': ['tb500', 'tb 500', 'thymosin beta-4', 'thymosin beta 4', 'thymosin b4'],
  'bpc-157 & tb-500 mix': ['bpc tb mix', 'bpc tb500 mix', 'bpc-157 tb-500', 'bpc tb combo', 'bpc tb blend', 'wolverine peptide', 'wolverine'],
  'll-37': ['ll37', 'll 37', 'cathelicidin'],
  'kpv': ['alpha-msh fragment', 'kpv tripeptide'],
  'thymosin alpha 1': ['ta1', 'thymosin alpha-1', 'ta-1', 'thymalfasin', 'zadaxin', 'thymosin a1'],
  'vip': ['vasoactive intestinal peptide', 'vasoactive intestinal polypeptide'],
  
  // Skin / Cosmetic
  'ghk-cu': ['ghk cu', 'ghkcu', 'copper peptide', 'ghk copper', 'copper tripeptide'],
  'ahk-cu': ['ahk cu', 'ahkcu', 'ahk copper'],
  'snap-8': ['snap8', 'snap 8', 'acetyl octapeptide-3'],
  'beyond hair': ['hair peptide', 'hair growth peptide'],
  'beyond skin': ['skin peptide', 'skin rejuvenation peptide'],
  
  // Growth Hormone Releasing
  'cjc-1295': ['cjc1295', 'cjc 1295', 'cjc-1295 dac', 'cjc-1295 with dac'],
  'cjc-1295 no dac': ['cjc-1295 (no dac)', 'cjc-1295 without dac', 'cjc no dac', 'mod grf 1-29', 'mod grf', 'mod-grf', 'modified grf'],
  'ipamorelin': ['ipam', 'ipa', 'nnc 26-0161', 'ipamorelin acetate'],
  'ghrp-6': ['ghrp6', 'ghrp 6'],
  'ghrp-2': ['ghrp2', 'ghrp 2'],
  'tesamorelin': ['th9507', 'egrifta', 'tesamorelin acetate'],
  'hexarelin': ['hex', 'examorelin'],
  'sermorelin': ['grf 1-29', 'geref'],
  
  // IGF / Growth Factors
  'igf-1 lr3': ['igf1 lr3', 'igf-1lr3', 'igf1lr3', 'long r3 igf-1', 'lr3 igf-1', 'igf-1 long r3', 'long igf-1'],
  'igf-1 des': ['igf1 des', 'des igf-1', 'des(1-3)igf-1'],
  'mgf': ['mechano growth factor', 'igf-1ec'],
  'peg-mgf': ['pegylated mgf', 'peg mgf', 'pegmgf', 'peg-mgf peptide'],
  'follistatin': ['fst', 'follistatin 344', 'follistatin-344', 'fs344'],
  'ace-031': ['ace031', 'ace 031', 'acvr2b'],
  
  // Longevity / Anti-Aging
  'epithalon': ['epitalon', 'epitalone', 'epithalone', 'epithalon peptide', 'aedg peptide'],
  'humanin': ['hn', 'humanin peptide'],
  'ss-31': ['ss31', 'ss 31', 'elamipretide', 'bendavia', 'mtp-131'],
  'nad+': ['nad plus', 'nicotinamide adenine dinucleotide', 'nad', 'nad peptide'],
  
  // Cognitive / Neurological
  'selank': ['selank peptide', 'tp-7', 'selank acetate'],
  'semax': ['semax peptide', 'semax acetate', 'semax nasal'],
  'dsip': ['delta sleep inducing peptide', 'delta sleep peptide', 'delta-sleep-inducing peptide'],
  'pe-22-28': ['pe2228', 'pe 22 28', 'spadin'],
  'dihexa': ['pnb-0408'],
  
  // Hormones
  'hcg': ['human chorionic gonadotropin', 'chorionic gonadotropin', 'pregnyl', 'novarel', 'ovidrel'],
  
  // Branded Blends / Specialty
  'beyond gut pro': ['gut pro', 'gut health peptide', 'beyond gut'],
  'beyond sleep': ['sleep peptide', 'sleep blend'],
  'klow': ['klow peptide'],
  'methylene blue': ['methylthioninium chloride', 'mb', 'methylene blue solution'],
  'l-carnitine': ['lcarnitine', 'l carnitine', 'carnitine', 'acetyl l-carnitine'],
  'bacteriostatic water': ['bac water', 'sterile water', 'reconstitution water'],
  
  // Other
  'lle': [],
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
