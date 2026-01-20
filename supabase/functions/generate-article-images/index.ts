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
  // For regenerating specific images
  regenerateFeatured?: boolean;
  regenerateSections?: string[]; // Section IDs to regenerate
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

    const { 
      articleTitle, 
      articleSummary, 
      sectionSuggestions,
      regenerateFeatured = true,
      regenerateSections
    } = await req.json() as ImageRequest;

    if (!articleTitle) {
      return new Response(
        JSON.stringify({ error: 'Article title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating images for article:', articleTitle);
    console.log('Regenerate featured:', regenerateFeatured);
    console.log('Section suggestions:', sectionSuggestions?.length || 0);

    // Helper function to generate a single image with retry logic
    const generateImageWithRetry = async (prompt: string, maxRetries = 3): Promise<string | null> => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Image generation attempt ${attempt}/${maxRetries}`);
          
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
            console.error(`Image generation error (attempt ${attempt}):`, response.status, errorText);
            
            // If rate limited or server error, wait and retry
            if (response.status === 429 || response.status >= 500) {
              if (attempt < maxRetries) {
                const waitTime = attempt * 2000; // 2s, 4s, 6s
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(r => setTimeout(r, waitTime));
                continue;
              }
            }
            return null;
          }

          const data = await response.json();
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (imageUrl) {
            console.log('Image generated successfully');
            return imageUrl;
          }
          
          console.error('No image URL in response');
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch (error) {
          console.error(`Error generating image (attempt ${attempt}):`, error);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }
      
      console.error('All retry attempts failed for image generation');
      return null;
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

    let featuredImageUrl: string | null = null;
    const contentImages: ContentImage[] = [];

    // 1. Generate featured image (with retry logic)
    if (regenerateFeatured) {
      console.log('Generating featured image with retry logic...');
      const featuredPrompt = `Create a professional scientific illustration for a research article titled "${articleTitle}". 
Style: Clean, modern, dark slate-900 background (#0f172a) with cyan and electric blue molecular/scientific accents. 
Subject: Abstract visualization of ${articleSummary?.substring(0, 100) || 'peptide research'}. 
High-tech laboratory aesthetic. Professional, clinical, authoritative.
16:9 aspect ratio. Ultra high resolution.
IMPORTANT: No text, no labels, no words - purely visual illustration.`;

      const featuredBase64 = await generateImageWithRetry(featuredPrompt);

      if (featuredBase64) {
        featuredImageUrl = await uploadImage(featuredBase64, `${filePrefix}-featured-${timestamp}`);
        console.log('Featured image uploaded:', featuredImageUrl ? 'success' : 'failed');
      } else {
        console.error('Featured image generation failed after all retries');
      }
    }

    // 2. Generate section images (max 3)
    const sectionsToProcess = (sectionSuggestions || []).slice(0, 3);
    
    // If regenerateSections is specified, only process those sections
    const filteredSections = regenerateSections 
      ? sectionsToProcess.filter(s => regenerateSections.includes(s.sectionId))
      : sectionsToProcess;

    for (let i = 0; i < filteredSections.length; i++) {
      const section = filteredSections[i];
      console.log(`Generating section image ${i + 1}/${filteredSections.length}: ${section.sectionTitle} (ID: ${section.sectionId})`);

      const sectionPrompt = `Create a scientific illustration for a section titled "${section.sectionTitle}".
${section.imagePrompt}
Style: Clean, minimal, dark slate-900 background (#0f172a), cyan/electric blue accents.
Professional research/laboratory aesthetic. 
16:9 aspect ratio. Ultra high resolution.
IMPORTANT: No text, no labels, no words - purely visual illustration.`;

      const sectionBase64 = await generateImageWithRetry(sectionPrompt, 2); // 2 retries for sections

      if (sectionBase64) {
        const sectionUrl = await uploadImage(sectionBase64, `${filePrefix}-${section.sectionId}-${timestamp}`);
        if (sectionUrl) {
          contentImages.push({
            sectionId: section.sectionId,
            imageUrl: sectionUrl,
            altText: `Illustration for ${section.sectionTitle}`,
          });
          console.log(`Section image ${i + 1} uploaded successfully (sectionId: ${section.sectionId})`);
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
