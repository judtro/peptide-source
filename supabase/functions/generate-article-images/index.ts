import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageRequest {
  articleTitle: string;
  articleSummary: string;
  sectionSuggestions: Array<{
    sectionId: string;
    sectionTitle: string;
    imagePrompt: string;
  }>;
}

interface ContentImage {
  sectionId: string;
  imageUrl: string;
  altText: string;
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for uploading to storage
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user session and admin role
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData } = await supabase
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

    const { articleTitle, articleSummary, sectionSuggestions } = await req.json() as ImageRequest;

    if (!articleTitle) {
      return new Response(
        JSON.stringify({ error: 'Article title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating images for article:', articleTitle);

    // Helper function to generate a single image
    const generateImage = async (prompt: string): Promise<string | null> => {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            modalities: ['image', 'text'],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Image generation error:', response.status, errorText);
          return null;
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        return imageUrl || null;
      } catch (error) {
        console.error('Error generating image:', error);
        return null;
      }
    };

    // Helper function to upload base64 image to Supabase Storage
    const uploadImage = async (base64Data: string, fileName: string): Promise<string | null> => {
      try {
        // Extract base64 content (remove data:image/xxx;base64, prefix)
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          console.error('Invalid base64 image format');
          return null;
        }

        const extension = matches[1];
        const base64Content = matches[2];
        const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));

        const filePath = `${fileName}.${extension}`;
        const contentType = `image/${extension}`;

        const { data, error } = await supabaseAdmin.storage
          .from('article-images')
          .upload(filePath, binaryData, {
            contentType,
            upsert: true,
          });

        if (error) {
          console.error('Storage upload error:', error);
          return null;
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('article-images')
          .getPublicUrl(data.path);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    };

    // Generate unique file prefix from article title
    const filePrefix = articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    const timestamp = Date.now();

    // 1. Generate featured image
    console.log('Generating featured image...');
    const featuredPrompt = `Create a professional scientific illustration for a research article titled "${articleTitle}". 
Style: Clean, modern, dark slate-900 background (#0f172a) with cyan and electric blue molecular/scientific accents. 
Subject: Abstract visualization of ${articleSummary.substring(0, 100)}. 
High-tech laboratory aesthetic. Professional, clinical, authoritative.
16:9 aspect ratio. Ultra high resolution.
IMPORTANT: No text, no labels, no words - purely visual illustration.`;

    const featuredBase64 = await generateImage(featuredPrompt);
    let featuredImageUrl: string | null = null;

    if (featuredBase64) {
      featuredImageUrl = await uploadImage(featuredBase64, `${filePrefix}-featured-${timestamp}`);
      console.log('Featured image uploaded:', featuredImageUrl ? 'success' : 'failed');
    }

    // 2. Generate section images (max 3)
    const contentImages: ContentImage[] = [];
    const sectionsToProcess = (sectionSuggestions || []).slice(0, 3);

    for (let i = 0; i < sectionsToProcess.length; i++) {
      const section = sectionsToProcess[i];
      console.log(`Generating section image ${i + 1}/${sectionsToProcess.length}: ${section.sectionTitle}`);

      const sectionPrompt = `Create a scientific illustration for a section titled "${section.sectionTitle}".
${section.imagePrompt}
Style: Clean, minimal, dark slate-900 background (#0f172a), cyan/electric blue accents.
Professional research/laboratory aesthetic. 
16:9 aspect ratio. Ultra high resolution.
IMPORTANT: No text, no labels, no words - purely visual illustration.`;

      const sectionBase64 = await generateImage(sectionPrompt);

      if (sectionBase64) {
        const sectionUrl = await uploadImage(sectionBase64, `${filePrefix}-${section.sectionId}-${timestamp}`);
        if (sectionUrl) {
          contentImages.push({
            sectionId: section.sectionId,
            imageUrl: sectionUrl,
            altText: `Illustration for ${section.sectionTitle}`,
          });
          console.log(`Section image ${i + 1} uploaded successfully`);
        }
      }
    }

    console.log(`Image generation complete: featured=${!!featuredImageUrl}, sections=${contentImages.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        featuredImageUrl,
        contentImages,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-article-images:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate images' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
