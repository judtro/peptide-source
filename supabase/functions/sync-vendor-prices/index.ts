import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractPricesTool = {
  type: "function",
  function: {
    name: "extract_product_prices",
    description: "Extract product prices from website content",
    parameters: {
      type: "object",
      properties: {
        products: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Product name (peptide name)" },
              price: { type: "number", description: "Price in USD" },
              sizeMg: { type: "number", description: "Size in milligrams" },
              inStock: { type: "boolean", description: "Whether the product is in stock" },
              url: { type: "string", description: "Product page URL if available" }
            },
            required: ["name", "price"]
          }
        }
      },
      required: ["products"]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendorId, syncAll } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get vendors to sync
    let vendorsQuery = supabase.from('vendors').select('id, name, website, slug');
    if (!syncAll && vendorId) {
      vendorsQuery = vendorsQuery.eq('id', vendorId);
    }

    const { data: vendors, error: vendorsError } = await vendorsQuery;
    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch vendors' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!vendors || vendors.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No vendors found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing prices for ${vendors.length} vendor(s)`);

    const results = [];

    for (const vendor of vendors) {
      if (!vendor.website) {
        console.log(`Skipping ${vendor.name}: No website`);
        results.push({ vendorName: vendor.name, error: 'No website configured' });
        continue;
      }

      try {
        console.log(`Scraping ${vendor.name}: ${vendor.website}`);

        // Scrape the vendor website
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: vendor.website,
            formats: ['markdown'],
            onlyMainContent: false,
            waitFor: 3000,
          }),
        });

        if (!scrapeResponse.ok) {
          console.error(`Scrape failed for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'Scrape failed' });
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const content = scrapeData.data?.markdown || scrapeData.markdown || '';

        if (!content) {
          console.log(`No content for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'No content found' });
          continue;
        }

        // Extract prices using AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { 
                role: 'system', 
                content: `Extract all peptide product prices from this vendor website content. 
Focus on peptides like: BPC-157, TB-500, Semaglutide, Tirzepatide, Retatrutide, GHK-Cu, Ipamorelin, CJC-1295, GHRP-6, GHRP-2, Melanotan II, PT-141, Oxytocin, Selank, Semax, Epithalon, DSIP, AOD-9604, Fragment 176-191, MGF, IGF-1 LR3, Thymosin Alpha-1, LL-37, KPV, GLP-1, Tesamorelin.
Extract exact prices in USD. If multiple sizes are available, include each as a separate product entry.`
              },
              { role: 'user', content: `Extract product prices from:\n\n${content.substring(0, 40000)}` }
            ],
            tools: [extractPricesTool],
            tool_choice: { type: "function", function: { name: "extract_product_prices" } }
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI extraction failed for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'AI extraction failed' });
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall) {
          console.log(`No products found for ${vendor.name}`);
          results.push({ vendorName: vendor.name, productsUpdated: 0 });
          continue;
        }

        let extractedProducts;
        try {
          extractedProducts = JSON.parse(toolCall.function.arguments);
        } catch {
          console.error(`Failed to parse AI response for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'Parse error' });
          continue;
        }

        const products = extractedProducts.products || [];
        console.log(`Found ${products.length} products for ${vendor.name}`);

        // Upsert products
        let updatedCount = 0;
        for (const product of products) {
          const pricePerMg = product.sizeMg && product.price 
            ? product.price / product.sizeMg 
            : null;

          const { error: upsertError } = await supabase
            .from('vendor_products')
            .upsert({
              vendor_id: vendor.id,
              product_name: product.name,
              price: product.price,
              price_per_mg: pricePerMg,
              size_mg: product.sizeMg || null,
              in_stock: product.inStock ?? true,
              source_url: product.url || vendor.website,
              last_synced_at: new Date().toISOString(),
            }, {
              onConflict: 'vendor_id,product_name,size_mg'
            });

          if (upsertError) {
            console.error(`Failed to upsert product ${product.name}:`, upsertError);
          } else {
            updatedCount++;
          }
        }

        results.push({
          vendorName: vendor.name,
          productsUpdated: updatedCount,
          productsFound: products.length
        });

      } catch (vendorError) {
        console.error(`Error processing ${vendor.name}:`, vendorError);
        results.push({ vendorName: vendor.name, error: 'Processing error' });
      }
    }

    console.log('Sync complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to sync prices';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
