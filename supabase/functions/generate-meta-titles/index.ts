import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'nl', 'pl'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, summary, meta_title, slug');

    if (articlesError) throw articlesError;

    console.log(`Found ${articles?.length || 0} articles to process`);

    const results: { articleId: string; language: string; metaTitle: string; status: string }[] = [];

    for (const article of articles || []) {
      // Generate English meta title if missing
      if (!article.meta_title) {
        console.log(`Generating English meta title for: ${article.title}`);
        
        const englishMetaTitle = await generateMetaTitle(
          LOVABLE_API_KEY,
          article.title,
          article.summary || '',
          'en'
        );

        if (englishMetaTitle) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({ meta_title: englishMetaTitle })
            .eq('id', article.id);

          if (updateError) {
            console.error(`Failed to update English meta title for ${article.id}:`, updateError);
            results.push({ articleId: article.id, language: 'en', metaTitle: '', status: 'error' });
          } else {
            results.push({ articleId: article.id, language: 'en', metaTitle: englishMetaTitle, status: 'success' });
          }
        }
      } else {
        results.push({ articleId: article.id, language: 'en', metaTitle: article.meta_title, status: 'exists' });
      }

      // Fetch existing translations for this article
      const { data: translations } = await supabase
        .from('article_translations')
        .select('language, meta_title, title, summary')
        .eq('article_id', article.id);

      const translationMap = new Map(translations?.map(t => [t.language, t]) || []);

      // Generate meta titles for each non-English language
      for (const lang of SUPPORTED_LANGUAGES.filter(l => l !== 'en')) {
        const existingTranslation = translationMap.get(lang);
        
        if (existingTranslation && existingTranslation.meta_title) {
          results.push({ articleId: article.id, language: lang, metaTitle: existingTranslation.meta_title, status: 'exists' });
          continue;
        }

        // Use translated title/summary if available, otherwise use English
        const titleToUse = existingTranslation?.title || article.title;
        const summaryToUse = existingTranslation?.summary || article.summary || '';

        console.log(`Generating ${lang} meta title for: ${article.title}`);

        const metaTitle = await generateMetaTitle(
          LOVABLE_API_KEY,
          titleToUse,
          summaryToUse,
          lang
        );

        if (metaTitle) {
          if (existingTranslation) {
            // Update existing translation
            const { error: updateError } = await supabase
              .from('article_translations')
              .update({ meta_title: metaTitle })
              .eq('article_id', article.id)
              .eq('language', lang);

            if (updateError) {
              console.error(`Failed to update ${lang} meta title for ${article.id}:`, updateError);
              results.push({ articleId: article.id, language: lang, metaTitle: '', status: 'error' });
            } else {
              results.push({ articleId: article.id, language: lang, metaTitle, status: 'success' });
            }
          } else {
            // Create new translation record with just the meta title
            // This is a minimal record that will be filled in when full translation is done
            console.log(`No existing translation for ${lang}, skipping meta title (no translation exists yet)`);
            results.push({ articleId: article.id, language: lang, metaTitle: '', status: 'no_translation' });
          }
        }
      }
    }

    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      exists: results.filter(r => r.status === 'exists').length,
      errors: results.filter(r => r.status === 'error').length,
      noTranslation: results.filter(r => r.status === 'no_translation').length,
    };

    console.log('Generation complete:', summary);

    return new Response(
      JSON.stringify({ success: true, results, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating meta titles:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateMetaTitle(
  apiKey: string,
  title: string,
  summary: string,
  language: string
): Promise<string | null> {
  const languageInstructions: Record<string, string> = {
    en: 'Write in English.',
    de: 'Write in German (Deutsch).',
    fr: 'Write in French (Français).',
    es: 'Write in Spanish (Español).',
    nl: 'Write in Dutch (Nederlands).',
    pl: 'Write in Polish (Polski).',
  };

  const systemPrompt = `You are an SEO expert specializing in scientific research content. Generate an optimized meta title for an article.

Rules:
- MUST be 50-60 characters (including spaces)
- Include the main keyword naturally
- Make it compelling and click-worthy
- For scientific peptide research content, maintain authority and credibility
- ${languageInstructions[language] || 'Write in English.'}
- Return ONLY the meta title, nothing else - no quotes, no explanation`;

  const userPrompt = `Generate an SEO meta title for this article:

Title: ${title}
Summary: ${summary}

Remember: 50-60 characters maximum, include main topic/keyword, make it compelling.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const metaTitle = data.choices?.[0]?.message?.content?.trim();
    
    if (!metaTitle) {
      console.error('No content in AI response');
      return null;
    }

    // Clean up the response - remove quotes if present
    const cleanedTitle = metaTitle.replace(/^["']|["']$/g, '').trim();
    
    console.log(`Generated meta title (${language}): ${cleanedTitle} (${cleanedTitle.length} chars)`);
    
    return cleanedTitle;
  } catch (error) {
    console.error('Error calling AI API:', error);
    return null;
  }
}
