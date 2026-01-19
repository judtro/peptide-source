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
              inStock: { 
                type: "boolean", 
                description: "Stock availability. DEFAULT TO TRUE. Only set to false if you see EXPLICIT 'Out of Stock', 'Sold Out', or 'Unavailable' text. If uncertain or no indicator visible, MUST be true."
              },
              url: { type: "string", description: "Product page URL if available" }
            },
            required: ["name", "price", "inStock"]
          }
        }
      },
      required: ["products"]
    }
  }
};

// Clean markdown content to make stock indicators clearer for AI
function cleanMarkdownForStockDetection(content: string): string {
  return content
    // Replace image markers followed by stock text with clear indicators
    .replace(/!\[\]\s*In Stock/gi, '[STATUS: IN_STOCK]')
    .replace(/!\[\]\s*Out of Stock/gi, '[STATUS: OUT_OF_STOCK]')
    .replace(/!\[\]\s*Sold Out/gi, '[STATUS: SOLD_OUT]')
    .replace(/!\[\]\s*Available/gi, '[STATUS: AVAILABLE]')
    .replace(/!\[\]\s*Unavailable/gi, '[STATUS: UNAVAILABLE]')
    // Normalize availability patterns
    .replace(/Availability:\s*(\d+)\s*in stock/gi, '[STATUS: IN_STOCK - $1 units available]')
    .replace(/Availability:\s*In Stock/gi, '[STATUS: IN_STOCK]')
    .replace(/Availability:\s*Out of Stock/gi, '[STATUS: OUT_OF_STOCK]')
    // Handle common button patterns that indicate in-stock
    .replace(/Add to Cart/gi, '[ACTION: ADD_TO_CART - product is in stock]')
    .replace(/Buy Now/gi, '[ACTION: BUY_NOW - product is in stock]')
    .replace(/Select options/gi, '[ACTION: SELECT_OPTIONS - product has variants and is in stock]');
}

// Validate stock status - override false negatives when no explicit out-of-stock indicator
function validateStockStatus(product: any, pageContent: string): boolean {
  // If AI already said in stock, trust it
  if (product.inStock === true) {
    return true;
  }
  
  // If AI said out of stock, verify by checking for explicit indicators in the content
  const lowerContent = pageContent.toLowerCase();
  const productNameLower = (product.name || '').toLowerCase().split(/\s+/)[0]; // First word of product name
  
  // Find content around this product name
  const productIndex = lowerContent.indexOf(productNameLower);
  const contextStart = Math.max(0, productIndex - 500);
  const contextEnd = Math.min(lowerContent.length, productIndex + 1000);
  const productContext = productIndex >= 0 
    ? lowerContent.substring(contextStart, contextEnd) 
    : lowerContent;
  
  // Explicit out-of-stock indicators
  const outOfStockIndicators = [
    'out of stock',
    'sold out', 
    'currently unavailable',
    'not available',
    'back order',
    'pre-order',
    'coming soon',
    'temporarily unavailable',
    'status: out_of_stock',
    'status: sold_out',
    'status: unavailable'
  ];
  
  const hasOutOfStock = outOfStockIndicators.some(indicator => 
    productContext.includes(indicator)
  );
  
  // If no explicit out-of-stock indicator found, override to true
  if (!hasOutOfStock) {
    console.log(`Stock override: ${product.name} -> true (no explicit out-of-stock indicator found)`);
    return true;
  }
  
  return false;
}

// HIGH PRIORITY: Individual product pages
const PRODUCT_URL_PRIORITY_PATTERNS = [
  '/product/',      // Individual product pages (highest priority)
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

// URL patterns to exclude - be very specific
const EXCLUDE_URL_PATTERNS = [
  '/cart', '/checkout', '/basket',
  '/account', '/login', '/register', '/signin', '/signup',
  '/blog', '/news', '/article',
  '/contact', '/about', '/faq', '/help', '/support',
  '/terms', '/privacy', '/policy', '/legal',
  '/shipping', '/returns', '/refund',
  '/track', '/order-status',
  '/order-steps/', '/order-process/', '/how-to-order',  // Exclude order info pages
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

async function discoverProductUrls(websiteUrl: string, firecrawlKey: string): Promise<string[]> {
  console.log(`Discovering URLs on ${websiteUrl}`);
  
  try {
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        limit: 200,  // Increased limit for better coverage
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
    
    // Separate URLs by priority - prioritize actual product pages
    const priorityProductUrls = allUrls.filter(isPriorityProductUrl);
    const secondaryProductUrls = allUrls.filter(url => 
      isSecondaryProductUrl(url) && !priorityProductUrls.includes(url)
    );
    
    console.log(`Found ${priorityProductUrls.length} priority product URLs`);
    console.log(`Found ${secondaryProductUrls.length} secondary/category URLs`);
    
    // Take up to 5 priority product pages + 2 category pages + homepage (reduced for timeout prevention)
    const selectedUrls = [
      websiteUrl,
      ...priorityProductUrls.slice(0, 5),
      ...secondaryProductUrls.slice(0, 2)
    ];
    
    // Deduplicate
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
        waitFor: 1500, // Reduced from 3000 for faster scraping
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
  const batchSize = 3; // Scrape 3 pages in parallel
  
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
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    // Create client with user's auth for verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT and get user claims
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

    // Check if user has admin role
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

    // Now proceed with the sync operation using service role
    const { vendorId, syncAll } = await req.json();

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

    // Use service role for database operations
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
        console.log(`\n========== Processing ${vendor.name} ==========`);
        console.log(`Website: ${vendor.website}`);

        // Step 1: Discover product URLs using Firecrawl Map
        const urlsToScrape = await discoverProductUrls(vendor.website, firecrawlKey);
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

STOCK STATUS DETECTION - CRITICAL RULES (READ VERY CAREFULLY):

⚠️ DEFAULT RULE: Set inStock: true for EVERY product UNLESS you find EXPLICIT out-of-stock text.

ONLY set inStock: false if you see these EXACT phrases near the product:
- "Out of Stock" / "Out-of-Stock"
- "Sold Out" / "SoldOut"  
- "Currently Unavailable"
- "Not Available" / "Unavailable"
- "Back Order" / "Backorder"
- "Pre-Order" / "Preorder"
- "Coming Soon"

THESE ALL MEAN IN STOCK (set inStock: true):
- [STATUS: IN_STOCK] markers
- [ACTION: ADD_TO_CART] markers
- [ACTION: BUY_NOW] markers
- [ACTION: SELECT_OPTIONS] markers
- Any "Add to Cart", "Buy Now", "Order Now" buttons
- "Select options" (means product has variants - IT IS IN STOCK)
- Any quantity shown (e.g., "100 in stock", "5 available")
- Price displayed without strikethrough
- No stock indicator at all - DEFAULT TO TRUE

⚠️ CRITICAL: When in doubt, set inStock: true. We prefer false positives over false negatives.
⚠️ NEVER guess out-of-stock. Only mark as false with EXPLICIT evidence.`
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

        // Upsert products with stock validation
        let updatedCount = 0;
        for (const product of products) {
          const pricePerMg = product.sizeMg && product.price 
            ? product.price / product.sizeMg 
            : null;

          // Try to find a matching product_id by name
          let matchedProductId: string | null = null;
          const productNameLower = product.name.toLowerCase();
          for (const [dbName, dbId] of productsMap.entries()) {
            if (productNameLower.includes(dbName) || dbName.includes(productNameLower)) {
              matchedProductId = dbId;
              break;
            }
          }

          // Validate stock status - override false negatives
          const validatedInStock = validateStockStatus(product, combinedContent);

          const { error: upsertError } = await supabase
            .from('vendor_products')
            .upsert({
              vendor_id: vendor.id,
              product_id: matchedProductId,
              product_name: product.name,
              price: product.price,
              price_per_mg: pricePerMg,
              size_mg: product.sizeMg || null,
              in_stock: validatedInStock,
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
          productsFound: products.length,
          pagesScraped: urlsToScrape.length
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