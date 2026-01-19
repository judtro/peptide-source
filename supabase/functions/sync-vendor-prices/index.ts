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

// Common product name aliases for matching
const PRODUCT_ALIASES: Record<string, string[]> = {
  // Metabolic / Weight Loss
  'retatrutide': ['reta', 'triple g', 'triple-g', 'glp3', 'glp-3', 'glp 3', 'ly3437943', 'triple agonist'],
  'semaglutide': ['sema', 'glp-1', 'glp 1', 'ozempic', 'wegovy', 'rybelsus'],
  'tirzepatide': ['tirz', 'mounjaro', 'gip/glp-1', 'zepbound', 'gip glp-1'],
  'cagrilintide': ['cagri', 'nn9838'],
  'aod-9604': ['aod9604', 'aod 9604', 'hgh fragment'],
  'fragment 176-191': ['frag 176-191', 'hgh fragment', 'hgh frag', 'fragment 176 191'],
  '5-amino-1mq': ['5amino1mq', '5 amino 1mq', '5-amino 1mq', 'amino 1mq'],
  'aicar': ['acadesine', 'aica ribonucleotide'],
  'mots-c': ['motsc', 'mots c', 'mots-c peptide'],
  
  // Tanning / Sexual Health
  'melanotan 2': ['melanotan ii', 'melanotan-2', 'mt-2', 'mt2', 'mt 2', 'mt-ii', 'melanotan-ii'],
  'pt-141': ['pt141', 'pt 141', 'bremelanotide'],
  'kisspeptin': ['kiss-1', 'kiss1', 'kisspeptin-10', 'kp-10'],
  'oxytocin': ['oxt', 'pitocin'],
  
  // Recovery / Healing
  'bpc-157': ['bpc 157', 'bpc157', 'body protection compound', 'bepecin', 'pl 14736', 'pl14736'],
  'tb-500': ['tb500', 'tb 500', 'thymosin beta-4', 'thymosin beta 4', 'thymosin b4'],
  'll-37': ['ll37', 'll 37', 'cathelicidin'],
  'kpv': ['alpha-msh fragment', 'kpv tripeptide'],
  'thymosin alpha-1': ['ta1', 'thymosin alpha 1', 'ta-1', 'thymalfasin', 'zadaxin'],
  'vip': ['vasoactive intestinal peptide', 'vasoactive intestinal polypeptide'],
  
  // Skin / Cosmetic
  'ghk-cu': ['ghk cu', 'ghkcu', 'copper peptide', 'ghk copper', 'copper tripeptide'],
  'ahk-cu': ['ahk cu', 'ahkcu', 'ahk copper'],
  'snap-8': ['snap8', 'snap 8', 'acetyl octapeptide-3'],
  
  // Growth Hormone Releasing
  'cjc-1295': ['cjc1295', 'cjc 1295', 'cjc-1295 dac', 'cjc-1295 with dac'],
  'cjc-1295 no dac': ['cjc-1295 (no dac)', 'cjc-1295 without dac', 'cjc no dac', 'mod grf 1-29', 'mod grf', 'mod-grf', 'modified grf'],
  'ipamorelin': ['ipam', 'ipa', 'nnc 26-0161'],
  'ghrp-6': ['ghrp6', 'ghrp 6'],
  'ghrp-2': ['ghrp2', 'ghrp 2'],
  'tesamorelin': ['th9507', 'egrifta', 'tesamorelin acetate'],
  'hexarelin': ['hex', 'examorelin'],
  'sermorelin': ['grf 1-29', 'geref'],
  
  // IGF / Growth Factors
  'igf-1 lr3': ['igf1 lr3', 'igf-1lr3', 'igf1lr3', 'long r3 igf-1', 'lr3 igf-1'],
  'igf-1 des': ['igf1 des', 'des igf-1', 'des(1-3)igf-1'],
  'mgf': ['mechano growth factor', 'igf-1ec'],
  'peg-mgf': ['pegylated mgf', 'peg mgf'],
  'follistatin': ['fst', 'follistatin 344', 'follistatin-344', 'fs344'],
  'ace-031': ['ace031', 'ace 031', 'acvr2b'],
  
  // Longevity / Anti-Aging
  'epithalon': ['epitalon', 'epitalone', 'epithalone', 'epithalon peptide'],
  'humanin': ['hn', 'humanin peptide'],
  'ss-31': ['ss31', 'ss 31', 'elamipretide', 'bendavia', 'mtp-131'],
  'nad+': ['nad plus', 'nicotinamide adenine dinucleotide', 'nad'],
  
  // Cognitive / Neurological
  'selank': ['selank peptide', 'tp-7'],
  'semax': ['semax peptide', 'semax acetate'],
  'dsip': ['delta sleep inducing peptide', 'delta sleep peptide'],
  'pe-22-28': ['pe2228', 'pe 22 28', 'spadin'],
  'dihexa': ['pnb-0408'],
};

// Normalize product name for matching (without size suffix)
function normalizeForMatching(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\d+\s*(mg|mcg|µg|iu)$/i, '') // Remove size suffix
    .replace(/[-_]/g, ' ')                     // Normalize separators
    .replace(/\s+/g, ' ')                      // Single spaces
    .replace(/[()]/g, '')                      // Remove parentheses
    .trim();
}

// Find canonical name from aliases
function getCanonicalName(name: string): string {
  const normalized = normalizeForMatching(name);
  
  // Check if it matches any alias
  for (const [canonical, aliases] of Object.entries(PRODUCT_ALIASES)) {
    if (canonical === normalized || aliases.includes(normalized)) {
      return canonical;
    }
    // Also check partial matches
    if (normalized.includes(canonical) || canonical.includes(normalized)) {
      return canonical;
    }
    for (const alias of aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        return canonical;
      }
    }
  }
  
  return normalized;
}

// Enhanced product matching against database products
function findMatchingProduct(
  scrapedName: string, 
  productsMap: Map<string, { id: string; name: string; normalizedName: string }>
): { id: string; name: string } | null {
  const normalizedScraped = normalizeForMatching(scrapedName);
  const canonicalScraped = getCanonicalName(scrapedName);
  
  // 1. Exact match on normalized name
  for (const [_, product] of productsMap) {
    if (product.normalizedName === normalizedScraped) {
      return { id: product.id, name: product.name };
    }
  }
  
  // 2. Canonical name match
  for (const [_, product] of productsMap) {
    const canonicalDb = getCanonicalName(product.name);
    if (canonicalDb === canonicalScraped) {
      return { id: product.id, name: product.name };
    }
  }
  
  // 3. Partial match (scraped contains db name or vice versa)
  for (const [_, product] of productsMap) {
    if (normalizedScraped.includes(product.normalizedName) || 
        product.normalizedName.includes(normalizedScraped)) {
      return { id: product.id, name: product.name };
    }
  }
  
  return null;
}

// Build products map with normalized names
function buildProductsMap(dbProducts: { id: string; name: string }[]): Map<string, { id: string; name: string; normalizedName: string }> {
  const map = new Map();
  for (const p of dbProducts) {
    map.set(p.id, {
      id: p.id,
      name: p.name,
      normalizedName: normalizeForMatching(p.name)
    });
  }
  return map;
}

// Normalize product name to ensure consistent matching
function normalizeProductName(name: string, sizeMg?: number): string {
  // Get canonical name
  let normalized = getCanonicalName(name);
  
  // Title case the canonical name
  normalized = normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s*-\s*$/, '')
    .trim();
  
  // Handle special casing for known patterns
  normalized = normalized
    .replace(/bpc 157/i, 'BPC-157')
    .replace(/tb 500/i, 'TB-500')
    .replace(/ghk cu/i, 'GHK-Cu')
    .replace(/cjc 1295/i, 'CJC-1295')
    .replace(/ghrp 6/i, 'GHRP-6')
    .replace(/ghrp 2/i, 'GHRP-2')
    .replace(/aod 9604/i, 'AOD-9604')
    .replace(/igf 1 lr3/i, 'IGF-1 LR3')
    .replace(/pt 141/i, 'PT-141')
    .replace(/ll 37/i, 'LL-37')
    .replace(/mots c/i, 'MOTS-c')
    .replace(/nad\+/i, 'NAD+');
  
  // Append size in consistent format if provided
  if (sizeMg && sizeMg > 0) {
    normalized = `${normalized} ${sizeMg}mg`;
  }
  
  return normalized;
}

// Generate enhanced AI prompt with known products
function generateExtractionPrompt(knownProductNames: string[]): string {
  const productsList = knownProductNames.length > 0 
    ? knownProductNames.join(', ')
    : 'BPC-157, TB-500, Semaglutide, Tirzepatide, Retatrutide, GHK-Cu, Ipamorelin, CJC-1295';
    
  return `You are a peptide product data extractor. Extract ALL peptide product prices from the website content provided.

## PRIORITY PRODUCTS TO FIND (extract ALL size variants of these):
${productsList}

## COMMON NAME VARIATIONS TO RECOGNIZE:
- Melanotan 2 = Melanotan II = MT-2 = MT2 = MT II
- BPC-157 = BPC 157 = Body Protection Compound
- TB-500 = TB500 = Thymosin Beta-4
- Semaglutide = Sema = GLP-1 agonist
- Tirzepatide = Tirz = GIP/GLP-1 = Mounjaro
- CJC-1295 (No DAC) = CJC-1295 without DAC = CJC No DAC = MOD GRF 1-29
- Ipamorelin = Ipam = IPAM
- GHK-Cu = GHK Copper = Copper Peptide
- PT-141 = Bremelanotide
- Tesamorelin = TH9507 = Egrifta
- Epithalon = Epitalon
- AOD-9604 = AOD9604
- IGF-1 LR3 = IGF-1LR3

## EXTRACTION RULES:
1. Extract EVERY peptide product found, including ALL size variants
2. For products with multiple sizes, create SEPARATE entries (BPC-157 5mg, BPC-157 10mg = 2 entries)
3. Prices may be in USD ($), EUR (€), GBP (£) - keep the value as shown
4. Extract the sizeMg as a number (e.g., "5mg" -> 5, "10 mg" -> 10)
5. Include the product URL if visible in the content
6. For PRIORITY PRODUCTS above, use the standard name format shown

## STOCK STATUS (default to "in_stock" if unclear):
- "in_stock": Default. Use for "In Stock", "Available", "Add to Cart", "Buy Now", "Select options", or when no indicator
- "out_of_stock": ONLY for explicit "Out of Stock", "Sold Out", "Unavailable"
- "backorder": ONLY for explicit "Back Order", "Backorder", "On Backorder"
- "preorder": ONLY for explicit "Pre-Order", "Preorder"
- "coming_soon": ONLY for explicit "Coming Soon"

⚠️ CRITICAL: Default to "in_stock" unless you see an EXPLICIT out-of-stock phrase.`;
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

// Discover ALL product URLs for complete sync
async function discoverAllProductUrls(websiteUrl: string, firecrawlKey: string): Promise<string[]> {
  console.log(`[COMPLETE] Discovering ALL URLs on ${websiteUrl}`);
  
  try {
    const mapResponse = await fetch('https://api.firecrawl.dev/v1/map', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: websiteUrl,
        limit: 5000, // Maximum for complete sync
        includeSubdomains: false,
      }),
    });

    if (!mapResponse.ok) {
      console.log(`Map API failed for ${websiteUrl}`);
      return [];
    }

    const mapData = await mapResponse.json();
    const allUrls: string[] = mapData.links || mapData.data?.links || [];
    
    console.log(`[COMPLETE] Found ${allUrls.length} total URLs`);
    
    // Get ALL priority product URLs (no limit)
    const priorityProductUrls = allUrls.filter(isPriorityProductUrl);
    const secondaryProductUrls = allUrls.filter(url => 
      isSecondaryProductUrl(url) && !priorityProductUrls.includes(url)
    );
    
    console.log(`[COMPLETE] Found ${priorityProductUrls.length} priority product URLs`);
    console.log(`[COMPLETE] Found ${secondaryProductUrls.length} secondary/category URLs`);
    
    // Return ALL product URLs for complete sync
    const selectedUrls = [...priorityProductUrls, ...secondaryProductUrls];
    const uniqueUrls = [...new Set(selectedUrls)];
    
    console.log(`[COMPLETE] Selected ${uniqueUrls.length} total URLs to process`);
    
    return uniqueUrls;
  } catch (error) {
    console.error('[COMPLETE] Error discovering URLs:', error);
    return [];
  }
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

// Extract products from a single page or small batch
async function extractProductsFromContent(
  content: string, 
  lovableKey: string,
  knownProductNames: string[] = []
): Promise<any[]> {
  if (!content || content.length < 50) {
    return [];
  }

  const systemPrompt = generateExtractionPrompt(knownProductNames);

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract ALL product prices from this page content:\n\n${cleanMarkdownForStockDetection(content).substring(0, 30000)}` }
      ],
      tools: [extractPricesTool],
      tool_choice: { type: "function", function: { name: "extract_product_prices" } }
    }),
  });

  if (!aiResponse.ok) {
    console.error('AI extraction failed');
    return [];
  }

  const aiData = await aiResponse.json();
  const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    return [];
  }

  try {
    const extractedProducts = JSON.parse(toolCall.function.arguments);
    return extractedProducts.products || [];
  } catch {
    console.error('Failed to parse AI response');
    return [];
  }
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

    const { 
      vendorId, 
      syncAll, 
      syncType = 'fast',
      // Complete sync parameters
      discoverOnly = false,
      urls = null,
      syncStartedAt = null,
      finalize = false,
      batchSize = 5
    } = await req.json();

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

    // Handle COMPLETE sync mode
    if (syncType === 'complete') {
      if (!vendorId) {
        return new Response(
          JSON.stringify({ success: false, error: 'vendorId required for complete sync' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch the vendor
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name, website')
        .eq('id', vendorId)
        .single();

      if (vendorError || !vendor) {
        return new Response(
          JSON.stringify({ success: false, error: 'Vendor not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!vendor.website) {
        return new Response(
          JSON.stringify({ success: false, error: 'Vendor has no website configured' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DISCOVERY PHASE: Return all product URLs
      if (discoverOnly) {
        console.log(`[COMPLETE] Discovery phase for ${vendor.name}`);
        const productUrls = await discoverAllProductUrls(vendor.website, firecrawlKey);
        const startedAt = new Date().toISOString();
        
        return new Response(
          JSON.stringify({
            success: true,
            phase: 'discovery',
            vendorName: vendor.name,
            productUrls,
            totalUrls: productUrls.length,
            syncStartedAt: startedAt
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // FINALIZE PHASE: Clean up stale products
      if (finalize && syncStartedAt) {
        console.log(`[COMPLETE] Finalize phase for ${vendor.name}`);
        
        const { data: staleProducts, error: deleteError } = await supabase
          .from('vendor_products')
          .delete()
          .eq('vendor_id', vendor.id)
          .lt('last_synced_at', syncStartedAt)
          .select('id');

        const deletedCount = staleProducts?.length || 0;

        if (deleteError) {
          console.error(`Error cleaning stale products for ${vendor.name}:`, deleteError);
        } else {
          console.log(`[COMPLETE] Deleted ${deletedCount} stale products for ${vendor.name}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            phase: 'finalize',
            vendorName: vendor.name,
            staleRemoved: deletedCount
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // BATCH PROCESSING PHASE: Scrape and extract from provided URLs
      if (urls && Array.isArray(urls) && urls.length > 0) {
        console.log(`[COMPLETE] Processing batch of ${urls.length} URLs for ${vendor.name}`);
        
        // Fetch products from database for enhanced matching
        const { data: dbProducts } = await supabase
          .from('products')
          .select('id, name');
        
        const productsMap = buildProductsMap(dbProducts || []);
        const knownProductNames = dbProducts?.map(p => p.name) || [];
        console.log(`[COMPLETE] Loaded ${knownProductNames.length} known products for matching`);

        let totalProcessed = 0;
        let totalExtracted = 0;
        let totalUpserted = 0;
        let totalMatched = 0;
        const failedUrls: string[] = [];
        const processedProducts = new Set<string>();
        const unmatchedProducts: string[] = [];

        // Process URLs in small batches to avoid timeout
        const processBatchSize = Math.min(batchSize, 5);
        
        for (let i = 0; i < urls.length; i += processBatchSize) {
          const urlBatch = urls.slice(i, i + processBatchSize);
          
          // Scrape all pages in this batch concurrently
          const scrapeResults = await Promise.all(
            urlBatch.map(async (url: string) => {
              const content = await scrapeSinglePage(url, firecrawlKey);
              return { url, content };
            })
          );

          // Process each scraped page
          for (const { url, content } of scrapeResults) {
            totalProcessed++;
            
            if (!content) {
              failedUrls.push(url);
              continue;
            }

            // Extract products with known products list for AI guidance
            const products = await extractProductsFromContent(content, lovableKey, knownProductNames);
            totalExtracted += products.length;

            // Upsert each product
            for (const product of products) {
              const normalizedName = normalizeProductName(product.name, product.sizeMg);
              
              // Skip duplicates
              const uniqueKey = `${normalizedName}-${product.sizeMg || 0}`;
              if (processedProducts.has(uniqueKey)) {
                continue;
              }
              processedProducts.add(uniqueKey);

              const pricePerMg = product.sizeMg && product.price 
                ? product.price / product.sizeMg 
                : null;

              // Use enhanced matching to find product_id
              const matchedProduct = findMatchingProduct(product.name, productsMap);
              const matchedProductId = matchedProduct?.id || null;
              
              if (matchedProductId) {
                totalMatched++;
                console.log(`[MATCH] "${product.name}" -> "${matchedProduct?.name}" (ID: ${matchedProductId})`);
              } else {
                unmatchedProducts.push(product.name);
              }

              // Validate stock status using page content
              const validatedStockStatus = validateStockStatus(product, content);
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
                  source_url: product.url || url,
                  last_synced_at: syncStartedAt || new Date().toISOString(),
                }, {
                  onConflict: 'vendor_id,product_name,size_mg'
                });

              if (!upsertError) {
                totalUpserted++;
              }
            }
          }
        }

        console.log(`[COMPLETE] Batch done: ${totalProcessed} pages, ${totalExtracted} extracted, ${totalUpserted} upserted, ${totalMatched} matched`);
        if (unmatchedProducts.length > 0) {
          console.log(`[COMPLETE] Unmatched products: ${unmatchedProducts.slice(0, 10).join(', ')}`);
        }

        return new Response(
          JSON.stringify({
            success: true,
            phase: 'batch',
            vendorName: vendor.name,
            urlsProcessed: totalProcessed,
            productsExtracted: totalExtracted,
            productsUpserted: totalUpserted,
            productsMatched: totalMatched,
            failedUrls: failedUrls.slice(0, 10),
            unmatchedProducts: unmatchedProducts.slice(0, 20)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If no specific phase, return error
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid complete sync request - specify discoverOnly, urls, or finalize' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle FAST/FULL sync mode (original behavior)
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

    // Fetch all products from the products table ONCE before the vendor loop
    const { data: allDbProducts } = await supabase
      .from('products')
      .select('id, name');
    
    const productsMap = buildProductsMap(allDbProducts || []);
    const knownProductNames = allDbProducts?.map(p => p.name) || [];
    console.log(`Loaded ${knownProductNames.length} known products for matching`);

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

        // Step 3: Extract prices using AI with known products prompt
        const systemPrompt = generateExtractionPrompt(knownProductNames);
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: systemPrompt },
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

        // Upsert products with normalized names, enhanced matching, and stock validation
        let updatedCount = 0;
        let matchedCount = 0;
        const processedProducts = new Set<string>();
        const unmatchedProducts: string[] = [];

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

          // Use enhanced matching to find product_id
          const matchedProduct = findMatchingProduct(product.name, productsMap);
          const matchedProductId = matchedProduct?.id || null;
          
          if (matchedProductId) {
            matchedCount++;
            console.log(`[MATCH] "${product.name}" -> "${matchedProduct?.name}"`);
          } else {
            unmatchedProducts.push(product.name);
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
          productsMatched: matchedCount,
          pagesScraped: urlsToScrape.length,
          staleRemoved: deletedCount || 0,
          unmatchedProducts: unmatchedProducts.slice(0, 10)
        });

        console.log(`✓ ${vendor.name}: ${updatedCount}/${products.length} products saved, ${matchedCount} matched to database`);
        if (unmatchedProducts.length > 0) {
          console.log(`  Unmatched: ${unmatchedProducts.slice(0, 5).join(', ')}${unmatchedProducts.length > 5 ? '...' : ''}`);
        }

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
