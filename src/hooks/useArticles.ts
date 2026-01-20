import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import type { Article, ArticleCategory, ArticleContentBlock, TableOfContentsItem, Citation, ArticleContentImage } from '@/types';
import type { Tables, Json } from '@/integrations/supabase/types';

type DbArticle = Tables<'articles'>;
type DbTranslation = Tables<'article_translations'>;

// Transform database article to app Article type
const transformArticle = (dbArticle: DbArticle): Article => ({
  id: dbArticle.id,
  slug: dbArticle.slug,
  title: dbArticle.title,
  metaTitle: dbArticle.meta_title || undefined,
  summary: dbArticle.summary || '',
  category: dbArticle.category as ArticleCategory,
  categoryLabel: dbArticle.category_label || '',
  readTime: dbArticle.read_time || 5,
  publishedDate: dbArticle.published_date || dbArticle.created_at,
  updatedAt: dbArticle.updated_at,
  author: {
    name: dbArticle.author_name || 'ChemVerify Research Team',
    role: dbArticle.author_role || '',
  },
  tableOfContents: (dbArticle.table_of_contents as unknown as TableOfContentsItem[]) || [],
  content: (dbArticle.content as unknown as ArticleContentBlock[]) || [],
  citations: (dbArticle.citations as unknown as Citation[]) || [],
  relatedPeptides: dbArticle.related_peptides || [],
  featuredImageUrl: (dbArticle as any).featured_image_url || undefined,
  contentImages: ((dbArticle as any).content_images as unknown as ArticleContentImage[]) || [],
});

// Transform article with translation overlay
const applyTranslation = (article: Article, translation: DbTranslation | null): Article => {
  if (!translation) return article;

  return {
    ...article,
    title: translation.title || article.title,
    metaTitle: translation.meta_title || article.metaTitle,
    summary: translation.summary || article.summary,
    content: (translation.content as unknown as ArticleContentBlock[]) || article.content,
    tableOfContents: (translation.table_of_contents as unknown as TableOfContentsItem[]) || article.tableOfContents,
  };
};

export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformArticle);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async (): Promise<Article | null> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? transformArticle(data) : null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get translated article based on current language
export const useTranslatedArticle = (slug: string) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'en'; // Handle 'en-US' -> 'en'

  return useQuery({
    queryKey: ['article', 'translated', slug, currentLang],
    queryFn: async (): Promise<Article | null> => {
      // First fetch the original article
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (articleError) throw articleError;
      if (!article) return null;

      const baseArticle = transformArticle(article);

      // If language is English, return the base article
      if (currentLang === 'en') {
        return baseArticle;
      }

      // Try to fetch translation for current language
      const { data: translation, error: translationError } = await supabase
        .from('article_translations')
        .select('*')
        .eq('article_id', article.id)
        .eq('language', currentLang)
        .maybeSingle();

      if (translationError) {
        console.warn('Error fetching translation:', translationError);
        return baseArticle; // Fallback to English
      }

      // Apply translation overlay or return base article
      return applyTranslation(baseArticle, translation);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useArticlesByCategory = (category: ArticleCategory) => {
  return useQuery({
    queryKey: ['articles', 'category', category],
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('published_date', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformArticle);
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

export const useRelatedArticles = (slug: string, limit: number = 3) => {
  return useQuery({
    queryKey: ['articles', 'related', slug, limit],
    queryFn: async (): Promise<Article[]> => {
      // First get the current article to find its category
      const { data: currentArticle, error: currentError } = await supabase
        .from('articles')
        .select('category')
        .eq('slug', slug)
        .maybeSingle();

      if (currentError) throw currentError;
      if (!currentArticle) return [];

      // Then get related articles in the same category
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', currentArticle.category)
        .neq('slug', slug)
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(transformArticle);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const getArticleCountByCategory = (articles: Article[], category: ArticleCategory): number => {
  return articles.filter(a => a.category === category).length;
};
