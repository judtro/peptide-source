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
              price: { type: "number", description: "Price in USD or EUR" },
              sizeMg: { type: "number", description: "Size in milligrams" },
              stockStatus: { 
                type: "string", 
                enum: ["in_stock", "out_of_stock", "backorder", "preorder", "coming_soon"],
                description: "Stock status. Use EXACT vendor terminology: 'in_stock' if available/Add to Cart, 'out_of_stock' for 'Out of Stock'/'Sold Out', 'backorder' for 'Back Order', 'preorder' for 'Pre-Order', 'coming_soon' for 'Coming Soon'. Default to 'in_stock' if unclear."
              },
              url: { type: "string", description: "Product page URL if available" }
            },
            required: ["name", "price", "stockStatus"]
          }
        }
      },
      required: ["products"]
    }
  }
};

// Normalize product name to ensure consistent matching
function normalizeProductName(name: string, sizeMg?: number): string {
  // Remove any existing size suffix
  let normalized = name
    .replace(/\s*\d+\s*(mg|mcg|µg)$/i, '')
    .trim();
  
  // Remove common suffixes that cause duplication
  normalized = normalized
    .replace(/\s*-\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Append size in consistent format if provided
  if (sizeMg && sizeMg > 0) {
    normalized = `${normalized} ${sizeMg}mg`;
  }
  
  return normalized;
}

// Validate stock status - override to in_stock when no explicit indicator found
function validateStockStatus(product: any, pageContent: string): string {
  const status = product.stockStatus || 'in_stock';
  
  // If already in_stock, trust it
  if (status === 'in_stock') {
    return 'in_stock';
  }
  
  // If marked as non-in_stock, verify by checking for explicit indicators
  const lowerContent = pageContent.toLowerCase();
  const productNameLower = (product.name || '').toLowerCase().split(/\s+/)[0];
  
  // Find content around this product name
  const productIndex = lowerContent.indexOf(productNameLower);
  const contextStart = Math.max(0, productIndex - 500);
  const contextEnd = Math.min(lowerContent.length, productIndex + 1000);
  const productContext = productIndex >= 0 
    ? lowerContent.substring(contextStart, contextEnd) 
    : lowerContent;
  
  // Explicit status indicators
  const statusIndicators: Record<string, string[]> = {
    'out_of_stock': ['out of stock', 'sold out', 'currently unavailable', 'not available', 'status: out_of_stock', 'status: sold_out', 'status: unavailable'],
    'backorder': ['back order', 'backorder', 'on backorder'],
    'preorder': ['pre-order', 'preorder', 'pre order'],
    'coming_soon': ['coming soon', 'coming-soon']
  };
  
  // Check if the claimed status has evidence
  const indicatorsForStatus = statusIndicators[status] || [];
  const hasEvidence = indicatorsForStatus.some(indicator => productContext.includes(indicator));
  
  if (!hasEvidence) {
    console.log(`Stock override: ${product.name} -> in_stock (no explicit indicator for ${status} found)`);
    return 'in_stock';
  }
  
  return status;
}

// Clean markdown content to make stock indicators clearer for AI
function cleanMarkdownForStockDetection(content: string): string {
  return content
    .replace(/!\[\]\s*In Stock/gi, '[STATUS: IN_STOCK]')
    .replace(/!\[\]\s*Out of Stock/gi, '[STATUS: OUT_OF_STOCK]')
    .replace(/!\[\]\s*Sold Out/gi, '[STATUS: SOLD_OUT]')
    .replace(/!\[\]\s*Available/gi, '[STATUS: AVAILABLE]')
    .replace(/!\[\]\s*Unavailable/gi, '[STATUS: UNAVAILABLE]')
    .replace(/!\[\]\s*Coming Soon/gi, '[STATUS: COMING_SOON]')
    .replace(/!\[\]\s*Pre-?Order/gi, '[STATUS: PREORDER]')
    .replace(/!\[\]\s*Back\s?Order/gi, '[STATUS: BACKORDER]')
    .replace(/Availability:\s*(\d+)\s*in stock/gi, '[STATUS: IN_STOCK - $1 units available]')
    .replace(/Availability:\s*In Stock/gi, '[STATUS: IN_STOCK]')
    .replace(/Availability:\s*Out of Stock/gi, '[STATUS: OUT_OF_STOCK]')
    .replace(/Add to Cart/gi, '[ACTION: ADD_TO_CART - product is in stock]')
    .replace(/Buy Now/gi, '[ACTION: BUY_NOW - product is in stock]')
    .replace(/Select options/gi, '[ACTION: SELECT_OPTIONS - product has variants and is in stock]');
}

// HIGH PRIORITY: Individual product pages
const PRODUCT_URL_PRIORITY_PATTERNS = [
  '/product/',
  '/products/',
  '/peptide/',
  '/peptides/',
  '/item/',
];

// SECONDARY: Category/shop listing pages
const PRODUCT_URL_SECONDARY_PATTERNS = [
  '/shop',
  '/store', 
  '/catalog',
  '/category',
  '/collection',
];

// URL patterns to exclude
const EXCLUDE_URL_PATTERNS = [
  '/cart', '/checkout', '/basket',
  '/account', '/login', '/register', '/signin', '/signup',
  '/blog', '/news', '/article',
  '/contact', '/about', '/faq', '/help', '/support',
  '/terms', '/privacy', '/policy', '/legal',
  '/shipping', '/returns', '/refund',
  '/track', '/order-status',
  '/order-steps/', '/order-process/', '/how-to-order',
  '/checkout-', '/payment', '/pay/',
  '/my-account', '/wishlist', '/compare',
  '.pdf', '.jpg', '.png', '.gif', '.svg',
  '/cdn-cgi/', '/wp-admin/', '/admin/'
];

function isPriorityProductUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  if (EXCLUDE_URL_PATTERNS.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  return PRODUCT_URL_PRIORITY_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

function isSecondaryProductUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase();
  if (EXCLUDE_URL_PATTERNS.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  return PRODUCT_URL_SECONDARY_PATTERNS.some(pattern => lowerUrl.includes(pattern));
}

async function discoverProductUrls(websiteUrl: string, firecrawlKey: string, syncType: 'fast' | 'full'): Promise<string[]> {
  console.log(`Discovering URLs on ${websiteUrl} (sync type: ${syncType})`);
  
  try {
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        limit: syncType === 'full' ? 500 : 200,
        includeSubdomains: false,
      }),
    });

    if (!mapResponse.ok) {
      console.log(`Map API failed for ${websiteUrl}, falling back to homepage`);
      return [websiteUrl];
    }

    const mapData = await mapResponse.json();
    const allUrls: string[] = mapData.links || mapData.data?.links || [];
    
    console.log(`Found ${allUrls.length} total URLs`);
    
    const priorityProductUrls = allUrls.filter(isPriorityProductUrl);
    const secondaryProductUrls = allUrls.filter(url => 
      isSecondaryProductUrl(url) && !priorityProductUrls.includes(url)
    );
    
    console.log(`Found ${priorityProductUrls.length} priority product URLs`);
    console.log(`Found ${secondaryProductUrls.length} secondary/category URLs`);
    
    // Adjust limits based on sync type
    const priorityLimit = syncType === 'full' ? 15 : 5;
    const secondaryLimit = syncType === 'full' ? 5 : 2;
    
    const selectedUrls = [
      websiteUrl,
      ...priorityProductUrls.slice(0, priorityLimit),
      ...secondaryProductUrls.slice(0, secondaryLimit)
    ];
    
    const uniqueUrls = [...new Set(selectedUrls)];
    console.log(`Selected ${uniqueUrls.length} URLs to scrape`);
    
    return uniqueUrls;
  } catch (error) {
    console.error('Error discovering URLs:', error);
    return [websiteUrl];
  }
}

async function scrapeSinglePage(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    console.log(`Scraping: ${url}`);
    
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: false,
        waitFor: 1500,
      }),
    });

    if (!scrapeResponse.ok) {
      console.log(`Failed to scrape ${url}`);
      return null;
    }

    const scrapeData = await scrapeResponse.json();
    const content = scrapeData.data?.markdown || scrapeData.markdown || '';
    
    if (content) {
      return `\n--- PAGE: ${url} ---\n${content}`;
    }
    return null;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function scrapeMultiplePages(urls: string[], firecrawlKey: string): Promise<string> {
  const contents: string[] = [];
  const batchSize = 3;
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => scrapeSinglePage(url, firecrawlKey))
    );
    contents.push(...batchResults.filter((c): c is string => c !== null));
  }
  
  return contents.join('\n\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

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

    const { data: roleData, error: roleError } = await supabaseAuth
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

    const { vendorId, syncAll, syncType = 'fast' } = await req.json();

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

    console.log(`Syncing prices for ${vendors.length} vendor(s) (sync type: ${syncType})`);

    const results = [];

    for (const vendor of vendors) {
      if (!vendor.website) {
        console.log(`Skipping ${vendor.name}: No website`);
        results.push({ vendorName: vendor.name, error: 'No website configured' });
        continue;
      }

      try {
        console.log(`\n========== Processing ${vendor.name} ==========`);
        console.log(`Website: ${vendor.website}`);

        // Record sync start time for stale cleanup
        const syncStartTime = new Date().toISOString();

        // Step 1: Discover product URLs
        const urlsToScrape = await discoverProductUrls(vendor.website, firecrawlKey, syncType as 'fast' | 'full');
        console.log(`Will scrape ${urlsToScrape.length} pages for ${vendor.name}`);

        // Step 2: Scrape all discovered pages
        const combinedContent = await scrapeMultiplePages(urlsToScrape, firecrawlKey);

        if (!combinedContent || combinedContent.length < 100) {
          console.log(`Insufficient content for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'No content found', pagesScraped: urlsToScrape.length });
          continue;
        }

        console.log(`Total content length for ${vendor.name}: ${combinedContent.length} chars`);

        // Step 3: Extract prices using AI
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
                content: `You are a peptide product data extractor. Extract ALL peptide product prices from the website content provided.

IMPORTANT RULES:
1. Extract EVERY peptide product you can find, even if you're not 100% sure it's a peptide
2. Include ALL size variants as separate entries (e.g., BPC-157 5mg, BPC-157 10mg should be 2 entries)
3. Prices may be in USD ($), EUR (€), GBP (£) - convert approximate value to USD if needed
4. Common peptides to look for: BPC-157, TB-500, Semaglutide, Tirzepatide, Retatrutide, GHK-Cu, Ipamorelin, CJC-1295, GHRP-6, GHRP-2, Melanotan II, PT-141, Oxytocin, Selank, Semax, Epithalon, DSIP, AOD-9604, Fragment 176-191, MGF, IGF-1 LR3, Thymosin Alpha-1, LL-37, KPV, GLP-1, Tesamorelin, NAD+, Follistatin, MOTS-c, Humanin
5. Extract the sizeMg as a number (e.g., "5mg" -> 5, "10 mg" -> 10)
6. Include the product URL if visible in the content

STOCK STATUS DETECTION - USE VENDOR'S EXACT TERMINOLOGY:

Set stockStatus based on what you see on the website:
- "in_stock": Default. Use for "In Stock", "Available", "Add to Cart", "Buy Now", "Select options", or when no indicator is present
- "out_of_stock": ONLY for explicit "Out of Stock", "Sold Out", "Unavailable"
- "backorder": ONLY for explicit "Back Order", "Backorder", "On Backorder"
- "preorder": ONLY for explicit "Pre-Order", "Preorder", "Pre Order"
- "coming_soon": ONLY for explicit "Coming Soon"

⚠️ CRITICAL: Default to "in_stock" unless you see one of the EXPLICIT phrases above.
⚠️ If a product shows "Add to Cart", "Buy Now", "Select options" - it is IN STOCK.
⚠️ If no stock indicator is visible - default to "in_stock".`
              },
              { role: 'user', content: `Extract ALL product prices from this vendor's website:\n\n${cleanMarkdownForStockDetection(combinedContent).substring(0, 80000)}` }
            ],
            tools: [extractPricesTool],
            tool_choice: { type: "function", function: { name: "extract_product_prices" } }
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI extraction failed for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'AI extraction failed', pagesScraped: urlsToScrape.length });
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (!toolCall) {
          console.log(`No products found for ${vendor.name}`);
          results.push({ vendorName: vendor.name, productsUpdated: 0, pagesScraped: urlsToScrape.length });
          continue;
        }

        let extractedProducts;
        try {
          extractedProducts = JSON.parse(toolCall.function.arguments);
        } catch {
          console.error(`Failed to parse AI response for ${vendor.name}`);
          results.push({ vendorName: vendor.name, error: 'Parse error', pagesScraped: urlsToScrape.length });
          continue;
        }

        const products = extractedProducts.products || [];
        console.log(`Found ${products.length} products for ${vendor.name}`);

        // Fetch all products from the products table to link vendor_products
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, name');
        
        const productsMap = new Map<string, string>();
        if (dbProducts) {
          for (const p of dbProducts) {
            productsMap.set(p.name.toLowerCase(), p.id);
          }
        }

        // Upsert products with normalized names and stock validation
        let updatedCount = 0;
        const processedProducts = new Set<string>();

        for (const product of products) {
          // Normalize the product name for consistent matching
          const normalizedName = normalizeProductName(product.name, product.sizeMg);
          
          // Skip duplicates within this sync
          const uniqueKey = `${normalizedName}-${product.sizeMg || 0}`;
          if (processedProducts.has(uniqueKey)) {
            console.log(`Skipping duplicate: ${uniqueKey}`);
            continue;
          }
          processedProducts.add(uniqueKey);

          const pricePerMg = product.sizeMg && product.price 
            ? product.price / product.sizeMg 
            : null;

          // Try to find a matching product_id by name
          let matchedProductId: string | null = null;
          const productNameLower = normalizedName.toLowerCase();
          for (const [dbName, dbId] of productsMap.entries()) {
            if (productNameLower.includes(dbName) || dbName.includes(productNameLower.replace(/\s*\d+mg$/, '').trim())) {
              matchedProductId = dbId;
              break;
            }
          }

          // Validate stock status
          const validatedStockStatus = validateStockStatus(product, combinedContent);
          const inStock = validatedStockStatus === 'in_stock';

          const { error: upsertError } = await supabase
            .from('vendor_products')
            .upsert({
              vendor_id: vendor.id,
              product_id: matchedProductId,
              product_name: normalizedName,
              price: product.price,
              price_per_mg: pricePerMg,
              size_mg: product.sizeMg || null,
              in_stock: inStock,
              stock_status: validatedStockStatus,
              source_url: product.url || vendor.website,
              last_synced_at: new Date().toISOString(),
            }, {
              onConflict: 'vendor_id,product_name,size_mg'
            });

          if (upsertError) {
            console.error(`Failed to upsert product ${normalizedName}:`, upsertError);
          } else {
            updatedCount++;
          }
        }

        // Clean up stale products that weren't updated in this sync
        const { data: staleProducts, error: deleteError } = await supabase
          .from('vendor_products')
          .delete()
          .eq('vendor_id', vendor.id)
          .lt('last_synced_at', syncStartTime)
          .select('id');

        const deletedCount = staleProducts?.length || 0;

        if (deleteError) {
          console.error(`Error cleaning stale products for ${vendor.name}:`, deleteError);
        } else if (deletedCount > 0) {
          console.log(`Deleted ${deletedCount} stale products for ${vendor.name}`);
        }

        results.push({
          vendorName: vendor.name,
          productsUpdated: updatedCount,
          productsFound: products.length,
          pagesScraped: urlsToScrape.length,
          staleRemoved: deletedCount || 0
        });

        console.log(`✓ ${vendor.name}: ${updatedCount}/${products.length} products saved`);

      } catch (vendorError) {
        console.error(`Error processing ${vendor.name}:`, vendorError);
        results.push({ vendorName: vendor.name, error: 'Processing error' });
      }
    }

    console.log('\n========== Sync Complete ==========');
    console.log('Results:', JSON.stringify(results, null, 2));

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
