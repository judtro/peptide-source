import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateArticleRequest {
  keyword: string;
  targetLength: 'short' | 'standard' | 'long';
  additionalContext?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for inserting new categories
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.log('Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      console.log('No user ID in token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Authorization check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.log('User is not an admin:', userId);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin access verified for user:', userId);

    const { keyword, targetLength, additionalContext } = await req.json() as GenerateArticleRequest;

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing categories from database
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('value, label');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    const categories = existingCategories || [
      { value: 'safety', label: 'Safety' },
      { value: 'handling', label: 'Handling' },
      { value: 'pharmacokinetics', label: 'Pharmacokinetics' },
      { value: 'verification', label: 'Verification' },
      { value: 'sourcing', label: 'Sourcing' },
    ];

    // Fetch all products (peptides) from database for matching
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, slug, synonyms');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    const peptideList = (products || []).map(p => ({
      name: p.name,
      slug: p.slug,
      synonyms: p.synonyms || [],
    }));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Determine word count based on target length
    const wordCounts = {
      short: '800-1000',
      standard: '1200-1500',
      long: '2000-2500',
    };
    const targetWords = wordCounts[targetLength] || wordCounts.standard;

    const categoryListText = categories.map(c => `"${c.value}" (${c.label})`).join(', ');
    const peptideListText = peptideList.map(p => `"${p.name}" (slug: ${p.slug})`).join(', ');

    const systemPrompt = `You are an expert SEO content writer for ChemVerify, a peptide research information website. 
Write comprehensive, scientifically accurate educational articles optimized for search engines.

SEO Requirements:
- Include the focus keyword naturally in the title, first paragraph, and 2-3 headings
- Use semantic variations and related terms throughout (1-2% keyword density)
- Write for researchers and scientists (professional but accessible tone)
- Structure content with clear H2/H3 hierarchy for readability
- Include actionable information, bullet lists, and informative callouts
- Aim for featured snippet potential with clear, concise answers
- Keep paragraphs concise (2-4 sentences each)

Content Guidelines:
- 100% original and unique content
- Scientifically accurate information
- Educational tone (not promotional)
- "Research use only" context
- Include practical tips and best practices
- Address common questions about the topic

Category Selection:
- Available categories: ${categoryListText}
- Choose the MOST appropriate category for the article content
- If NO existing category fits well, you may suggest a NEW category (use kebab-case for value)

Peptide Matching:
- Available peptides in our database: ${peptideListText}
- Identify any peptides mentioned in your content and match them to our database
- Use exact slug values when matching
- Only match peptides that are actually relevant to the content

Target length: ${targetWords} words`;

    const userPrompt = `Generate a complete SEO-optimized article about: "${keyword}"

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Create a comprehensive article with:
1. An engaging, SEO-optimized title including the keyword
2. A meta description (summary) of 150-160 characters
3. Select the best category from available options (or suggest a new one if needed)
4. Well-structured content with headings, paragraphs, lists, and callouts
5. Identify any peptides mentioned and match them to our product database`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_seo_article',
              description: 'Generate a complete SEO-optimized article with structured content and automatic category/peptide matching',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: 'SEO-optimized article title including the focus keyword (max 70 chars)',
                  },
                  summary: {
                    type: 'string',
                    description: 'Meta description for SEO (150-160 characters)',
                  },
                  category: {
                    type: 'string',
                    description: 'Selected category value (kebab-case, e.g., "safety", "handling")',
                  },
                  categoryLabel: {
                    type: 'string',
                    description: 'Human-readable category label (e.g., "Safety", "Handling")',
                  },
                  isNewCategory: {
                    type: 'boolean',
                    description: 'True if this is a NEW category not in the existing list',
                  },
                  tableOfContents: {
                    type: 'array',
                    description: 'Table of contents entries',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', description: 'Unique section ID (kebab-case)' },
                        title: { type: 'string', description: 'Section title' },
                        level: { type: 'number', description: 'Heading level (2 or 3)' },
                      },
                      required: ['id', 'title', 'level'],
                    },
                  },
                  content: {
                    type: 'array',
                    description: 'Article content blocks',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['heading', 'paragraph', 'list', 'callout'],
                          description: 'Type of content block',
                        },
                        id: { type: 'string', description: 'Section ID for headings (matches TOC)' },
                        level: { type: 'number', description: 'Heading level (2 or 3) for headings' },
                        text: { type: 'string', description: 'Text content for paragraphs, headings, or callouts' },
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'List items for list type',
                        },
                        variant: {
                          type: 'string',
                          enum: ['info', 'warning', 'note'],
                          description: 'Callout variant type',
                        },
                      },
                      required: ['type'],
                    },
                  },
                  readTime: {
                    type: 'number',
                    description: 'Estimated reading time in minutes',
                  },
                  relatedPeptides: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of related peptide names (display names) mentioned in the article',
                  },
                  matchedPeptideSlugs: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of matched peptide slugs from our database for internal linking',
                  },
                },
                required: ['title', 'summary', 'category', 'categoryLabel', 'isNewCategory', 'tableOfContents', 'content', 'readTime', 'relatedPeptides', 'matchedPeptideSlugs'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'generate_seo_article' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_seo_article') {
      throw new Error('Invalid AI response format');
    }

    const article = JSON.parse(toolCall.function.arguments);

    // If AI suggested a new category, insert it into the database
    if (article.isNewCategory && article.category && article.categoryLabel) {
      console.log('Creating new category:', article.category, article.categoryLabel);
      const { error: insertCategoryError } = await supabaseAdmin
        .from('article_categories')
        .insert({
          value: article.category,
          label: article.categoryLabel,
        });

      if (insertCategoryError) {
        // Log but don't fail - category might already exist
        console.error('Error inserting new category:', insertCategoryError);
      } else {
        console.log('New category created successfully');
      }
    }

    // Generate slug from title
    const slug = article.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 100);

    // Return complete article data
    return new Response(
      JSON.stringify({
        success: true,
        article: {
          title: article.title,
          summary: article.summary,
          slug,
          category: article.category,
          categoryLabel: article.categoryLabel,
          isNewCategory: article.isNewCategory || false,
          tableOfContents: article.tableOfContents,
          content: article.content,
          readTime: article.readTime,
          relatedPeptides: article.relatedPeptides || [],
          matchedPeptideSlugs: article.matchedPeptideSlugs || [],
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating article:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate article' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
