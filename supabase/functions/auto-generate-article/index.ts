import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduleRecord {
  id: string;
  is_active: boolean;
  frequency: 'daily' | 'weekly';
  day_of_week: number | null;
  time_of_day: string;
  target_length: 'short' | 'standard' | 'long';
  additional_context: string | null;
  last_run_at: string | null;
  next_run_at: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if this is a manual trigger with auth or a cron trigger
    const authHeader = req.headers.get('Authorization');
    let isManualTrigger = false;
    let forceGenerate = false;

    if (authHeader?.startsWith('Bearer ')) {
      // Manual trigger - verify user is admin
      const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
        global: { headers: { Authorization: authHeader } },
      });
      
      const { data: { user }, error: userError } = await anonClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: roleData } = await anonClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      isManualTrigger = true;
      const body = await req.json().catch(() => ({}));
      forceGenerate = body.forceGenerate === true;
    }

    console.log(`Auto-generate triggered. Manual: ${isManualTrigger}, Force: ${forceGenerate}`);

    // Get active schedule
    const { data: schedules, error: scheduleError } = await supabase
      .from('article_schedules')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (scheduleError) {
      console.error('Error fetching schedule:', scheduleError);
      throw scheduleError;
    }

    const schedule = schedules?.[0] as ScheduleRecord | undefined;

    if (!schedule && !forceGenerate) {
      console.log('No active schedule found and not force-generating');
      return new Response(
        JSON.stringify({ message: 'No active schedule', generated: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if it's time to generate (unless force-generating)
    if (!forceGenerate && schedule) {
      const now = new Date();
      const nextRun = schedule.next_run_at ? new Date(schedule.next_run_at) : null;
      
      if (nextRun && now < nextRun) {
        console.log(`Not time yet. Next run: ${nextRun.toISOString()}`);
        return new Response(
          JSON.stringify({ message: 'Not scheduled yet', nextRun: nextRun.toISOString(), generated: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch existing articles to avoid duplicate topics
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('title, slug')
      .order('created_at', { ascending: false })
      .limit(50);

    const existingTitles = (existingArticles || []).map(a => a.title.toLowerCase());

    // Fetch products for topic inspiration
    const { data: products } = await supabase
      .from('products')
      .select('name, category, description')
      .limit(30);

    const productList = (products || []).map(p => `${p.name} (${p.category})`).join(', ');

    // Use AI to generate a SEO-optimized topic
    console.log('Generating topic with AI...');
    
    const topicPrompt = `You are an SEO expert for ChemVerify, a research peptide information website.

Existing articles (DO NOT DUPLICATE these topics):
${existingTitles.slice(0, 20).join('\n')}

Available peptides in our database:
${productList}

Generate a NEW, unique SEO-valuable topic for a research peptide article. The topic should:
1. NOT duplicate any existing article topics
2. Target relevant keywords researchers search for
3. Be educational and scientific (not promotional)
4. Focus on research applications, mechanisms, or safety
5. Be specific enough to provide value

${schedule?.additional_context ? `Additional context: ${schedule.additional_context}` : ''}

Return ONLY a JSON object with these fields:
{
  "keyword": "main SEO keyword/keyphrase",
  "title": "suggested article title",
  "reasoning": "why this topic is SEO-valuable"
}`;

    const topicResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'user', content: topicPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!topicResponse.ok) {
      const errorText = await topicResponse.text();
      console.error('Topic generation error:', errorText);
      throw new Error('Failed to generate topic');
    }

    const topicData = await topicResponse.json();
    const topicContent = topicData.choices?.[0]?.message?.content;
    
    let topicInfo;
    try {
      topicInfo = JSON.parse(topicContent);
    } catch (e) {
      console.error('Failed to parse topic JSON:', topicContent);
      throw new Error('Invalid topic response format');
    }

    console.log('Generated topic:', topicInfo);

    // Now call the generate-article function
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-article`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: topicInfo.keyword,
        targetLength: schedule?.target_length || 'standard',
        additionalContext: schedule?.additional_context || undefined,
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Article generation error:', errorText);
      throw new Error('Failed to generate article');
    }

    const articleData = await generateResponse.json();

    if (!articleData?.article) {
      throw new Error('No article in response');
    }

    const article = articleData.article;

    // Sync content heading IDs with tableOfContents
    const syncedContent = article.content.map((block: any) => {
      if (block.type === 'heading' && block.text) {
        const tocEntry = article.tableOfContents.find(
          (toc: any) => toc.title.toLowerCase().trim() === block.text?.toLowerCase().trim()
        );
        if (tocEntry && !block.id) {
          return { ...block, id: tocEntry.id };
        }
      }
      return block;
    });

    // Rebuild tableOfContents from synced content
    const rebuiltToC = syncedContent
      .filter((block: any) => block.type === 'heading' && block.id)
      .map((block: any) => ({
        id: block.id,
        title: block.text,
        level: block.level || 2,
      }));

    // Generate images
    let featuredImageUrl = null;
    let contentImages: any[] = [];

    if (article.imageSuggestions && article.imageSuggestions.length > 0) {
      console.log('Generating images...');
      try {
        const imageResponse = await fetch(`${supabaseUrl}/functions/v1/generate-article-images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articleTitle: article.title,
            articleSummary: article.summary,
            sectionSuggestions: article.imageSuggestions,
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.success) {
            featuredImageUrl = imageData.featuredImageUrl;
            contentImages = imageData.contentImages || [];
          }
        }
      } catch (imgErr) {
        console.error('Image generation failed:', imgErr);
        // Continue without images
      }
    }

    // Save the article
    const { error: insertError } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category,
        category_label: article.categoryLabel,
        read_time: article.readTime,
        table_of_contents: rebuiltToC.length > 0 ? rebuiltToC : article.tableOfContents,
        content: syncedContent,
        related_peptides: article.relatedPeptides || [],
        featured_image_url: featuredImageUrl,
        content_images: contentImages,
        published_date: new Date().toISOString(),
        author_name: 'ChemVerify AI',
        author_role: 'Auto-Generated',
      });

    if (insertError) {
      console.error('Error saving article:', insertError);
      throw insertError;
    }

    console.log(`Article saved: ${article.title}`);

    // Update schedule with last run time and calculate next run
    if (schedule) {
      const now = new Date();
      let nextRun: Date;

      if (schedule.frequency === 'daily') {
        nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + 1);
      } else {
        // Weekly
        nextRun = new Date(now);
        nextRun.setDate(nextRun.getDate() + 7);
      }

      // Set the time
      const [hours, minutes] = schedule.time_of_day.split(':').map(Number);
      nextRun.setHours(hours, minutes, 0, 0);

      await supabase
        .from('article_schedules')
        .update({
          last_run_at: now.toISOString(),
          next_run_at: nextRun.toISOString(),
        })
        .eq('id', schedule.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: true,
        article: {
          title: article.title,
          slug: article.slug,
          category: article.category,
        },
        topic: topicInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auto-generate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to auto-generate article' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
