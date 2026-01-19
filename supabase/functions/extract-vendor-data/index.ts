import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractVendorTool = {
  type: "function",
  function: {
    name: "extract_vendor_info",
    description: "Extract vendor information from website content",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Company/vendor name" },
        region: { 
          type: "string", 
          enum: ["US", "EU", "UK", "CA"],
          description: "Primary warehouse/headquarters region" 
        },
        shippingRegions: { 
          type: "array", 
          items: { type: "string", enum: ["US", "EU", "UK", "CA"] },
          description: "Regions the vendor ships to"
        },
        location: { type: "string", description: "City/State/Country location" },
        yearFounded: { type: "string", description: "Year the company was founded" },
        paymentMethods: { 
          type: "array", 
          items: { type: "string" },
          description: "Accepted payment methods (e.g., Credit Card, Crypto, Zelle, PayPal)"
        },
        shippingMethods: { 
          type: "array", 
          items: { type: "string" },
          description: "Available shipping methods (e.g., USPS, FedEx, DHL)"
        },
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Product name (peptide name)" },
              price: { type: "number", description: "Price in USD" },
              sizeMg: { type: "number", description: "Size in milligrams" },
              inStock: { type: "boolean", description: "Whether the product is in stock" }
            },
            required: ["name", "price"]
          },
          description: "List of peptide products with prices"
        },
        description: { type: "string", description: "Brief company description (2-3 sentences)" }
      },
      required: ["name", "region", "shippingRegions"]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('Invalid token or no user:', userError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

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
        JSON.stringify({ success: false, error: 'Authorization check failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      console.log('User is not an admin:', userId);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin access verified for user:', userId);

    const { url, content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting vendor data from content, URL:', url);

    const systemPrompt = `You are an expert at extracting vendor information from peptide research chemical websites. 
Extract all relevant vendor details including:
- Company name and location
- Shipping regions and methods
- Payment methods accepted
- Product catalog with prices (focus on peptides)
- Any founding/established date

Be thorough but only extract information that is clearly present. For products, extract as many as you can find with their prices.
If a piece of information is not found, omit it rather than guessing.

Known peptide names to look for: BPC-157, TB-500, Semaglutide, Tirzepatide, Retatrutide, GHK-Cu, Ipamorelin, CJC-1295, GHRP-6, GHRP-2, Melanotan II, PT-141, Oxytocin, Selank, Semax, Epithalon, DSIP, AOD-9604, Fragment 176-191, MGF, IGF-1 LR3, Thymosin Alpha-1, LL-37, KPV, GLP-1, Tesamorelin.`;

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
          { role: 'user', content: `Extract vendor information from this website content:\n\nURL: ${url}\n\nContent:\n${content.substring(0, 50000)}` }
        ],
        tools: [extractVendorTool],
        tool_choice: { type: "function", function: { name: "extract_vendor_info" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI extraction failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_vendor_info') {
      console.error('No valid tool call in response:', aiData);
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return structured data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedData;
    try {
      extractedData = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully extracted vendor data:', extractedData.name);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: extractedData.name || '',
          region: extractedData.region || 'US',
          shippingRegions: extractedData.shippingRegions || ['US'],
          location: extractedData.location || '',
          yearFounded: extractedData.yearFounded || '',
          paymentMethods: extractedData.paymentMethods || [],
          shippingMethods: extractedData.shippingMethods || [],
          products: extractedData.products || [],
          description: extractedData.description || '',
          sourceUrl: url
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting vendor data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract vendor data';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
