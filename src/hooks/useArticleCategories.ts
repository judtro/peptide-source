import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ArticleCategoryOption {
  value: string;
  label: string;
}

export const useArticleCategories = () => {
  return useQuery({
    queryKey: ['article-categories'],
    queryFn: async (): Promise<ArticleCategoryOption[]> => {
      const { data, error } = await supabase
        .from('article_categories')
        .select('value, label')
        .order('label');

      if (error) throw error;
      return (data || []).map(c => ({
        value: c.value,
        label: c.label,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
