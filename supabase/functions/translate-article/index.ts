import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'pl', 'nl', 'es'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'German',
  fr: 'French',
  pl: 'Polish',
  nl: 'Dutch',
  es: 'Spanish',
};

interface ContentBlock {
  type: string;
  id?: string;
  level?: number;
  text?: string;
  items?: string[];
  variant?: string;
  citation?: {
    number: number;
    text: string;
    source: string;
  };
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, targetLanguage, translateAll } = await req.json();

    if (!articleId) {
      throw new Error("articleId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the original article
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .single();

    if (articleError || !article) {
      throw new Error("Article not found");
    }

    // Determine which languages to translate
    const languages: SupportedLanguage[] = translateAll
      ? SUPPORTED_LANGUAGES.filter(l => l !== 'en')
      : targetLanguage && SUPPORTED_LANGUAGES.includes(targetLanguage)
        ? [targetLanguage as SupportedLanguage]
        : [];

    if (languages.length === 0) {
      throw new Error("No valid target language specified");
    }

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const lang of languages) {
      try {
        console.log(`Translating article ${articleId} to ${LANGUAGE_NAMES[lang]}...`);

        // Prepare content for translation
        const contentToTranslate = {
          title: article.title,
          summary: article.summary || '',
          content: article.content as ContentBlock[],
          tableOfContents: article.table_of_contents as TableOfContentsItem[],
        };

        const translationPrompt = `You are a professional translator specializing in scientific and medical content. Translate the following article content from English to ${LANGUAGE_NAMES[lang]}.

CRITICAL RULES:
1. Maintain scientific accuracy and terminology
2. Keep peptide names, molecular formulas, and technical identifiers UNCHANGED (e.g., "BPC-157", "GH", "HPLC")
3. Preserve all formatting, structure, and JSON keys
4. Generate an SEO-optimized meta_title (50-60 characters) that includes the main keyword in ${LANGUAGE_NAMES[lang]}
5. The meta_title should be different from the title - optimized for search results
6. Keep all "id" fields exactly as they are - do not translate them
7. Return ONLY valid JSON, no markdown formatting

INPUT JSON:
${JSON.stringify(contentToTranslate, null, 2)}

OUTPUT FORMAT (JSON only):
{
  "title": "translated title",
  "meta_title": "SEO optimized title 50-60 chars",
  "summary": "translated summary",
  "content": [...translated content blocks with same structure...],
  "tableOfContents": [...translated ToC with same IDs...]
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "user", content: translationPrompt },
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI translation failed for ${lang}:`, errorText);
          results[lang] = { success: false, error: `AI error: ${aiResponse.status}` };
          continue;
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content || '';

        // Extract JSON from response
        let translatedContent;
        try {
          // Try to parse directly first
          translatedContent = JSON.parse(responseText);
        } catch {
          // Try to extract JSON from markdown code blocks
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            translatedContent = JSON.parse(jsonMatch[1].trim());
          } else {
            // Try to find JSON object in the response
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              translatedContent = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1));
            } else {
              throw new Error("Could not extract JSON from response");
            }
          }
        }

        // Upsert the translation
        const { error: upsertError } = await supabase
          .from("article_translations")
          .upsert({
            article_id: articleId,
            language: lang,
            title: translatedContent.title,
            meta_title: translatedContent.meta_title,
            summary: translatedContent.summary,
            content: translatedContent.content,
            table_of_contents: translatedContent.tableOfContents,
            is_auto_translated: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'article_id,language',
          });

        if (upsertError) {
          console.error(`Database error for ${lang}:`, upsertError);
          results[lang] = { success: false, error: upsertError.message };
        } else {
          results[lang] = { success: true };
          console.log(`Successfully translated to ${LANGUAGE_NAMES[lang]}`);
        }
      } catch (langError) {
        console.error(`Translation error for ${lang}:`, langError);
        results[lang] = { 
          success: false, 
          error: langError instanceof Error ? langError.message : "Unknown error" 
        };
      }
    }

    // Check if any translations succeeded
    const successCount = Object.values(results).filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        totalLanguages: languages.length,
        successCount,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("translate-article error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});