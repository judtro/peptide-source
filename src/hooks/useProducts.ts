import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

type DbProduct = Tables<'products'>;

// Transform database product to app Product type
const transformProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.slug, // Use slug as the ID for backwards compatibility
  name: dbProduct.name,
  slug: dbProduct.slug,
  category: dbProduct.category,
  description: dbProduct.description || '',
  molecularWeight: dbProduct.molecular_weight || '',
  purityStandard: dbProduct.purity_standard || '',
  sequence: dbProduct.sequence || '',
  synonyms: dbProduct.synonyms || [],
  halfLife: dbProduct.half_life || '',
  isPopular: dbProduct.is_popular || false,
  videoUrl: dbProduct.video_url || undefined,
});

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (idOrSlug: string) => {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', idOrSlug)
        .maybeSingle();

      if (error) throw error;
      return data ? transformProduct(data) : null;
    },
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePopularProducts = () => {
  return useQuery({
    queryKey: ['products', 'popular'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_popular', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('category');

      if (error) throw error;
      const categories = [...new Set((data || []).map(p => p.category))];
      return categories.sort();
    },
    staleTime: 5 * 60 * 1000,
  });
};
