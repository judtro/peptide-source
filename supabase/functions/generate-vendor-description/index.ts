import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Invalid token or no user:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return new Response(
        JSON.stringify({ error: "Authorization check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.log("User is not an admin:", userId);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Admin access verified for user:", userId);

    // Parse request body
    const { vendorName, region, website } = await req.json();
    
    if (!vendorName) {
      return new Response(
        JSON.stringify({ error: "Vendor name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input sanitization function to prevent prompt injection
    const sanitizeInput = (input: string | undefined | null): string => {
      if (!input) return "";
      
      return input
        // Remove newlines and carriage returns
        .replace(/[\n\r]/g, " ")
        // Remove common prompt injection patterns
        .replace(/ignore\s+(previous|all|above)/gi, "")
        .replace(/instead\s+of/gi, "")
        .replace(/actually[,\s]+/gi, "")
        // Remove quotes that could break prompt structure
        .replace(/["""''`]/g, "")
        // Remove backslashes
        .replace(/\\/g, "")
        // Collapse multiple spaces
        .replace(/\s+/g, " ")
        .trim();
    };

    // Validate and sanitize inputs
    const sanitizedName = sanitizeInput(vendorName);
    const sanitizedRegion = sanitizeInput(region);
    const sanitizedWebsite = sanitizeInput(website);

    // Additional validation for sanitized inputs
    if (!sanitizedName || sanitizedName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid vendor name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sanitizedWebsite && sanitizedWebsite.length > 500) {
      return new Response(
        JSON.stringify({ error: "Website URL too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt with clear delimiters and sanitized inputs
    const promptParts = [
      "Write a professional, concise description (2-3 sentences, max 150 words) for a peptide research vendor.",
      "",
      "=== VENDOR DETAILS ===",
      `Vendor Name: ${sanitizedName}`,
      sanitizedRegion ? `Region: ${sanitizedRegion}` : "",
      sanitizedWebsite ? `Website: ${sanitizedWebsite}` : "",
      "=== END DETAILS ===",
      "",
      "Requirements:",
      "- Sound professional and trustworthy",
      "- Mention their focus on research-grade peptides",
      "- Highlight quality assurance and customer service",
      "- Be suitable for a vendor directory listing",
      "",
      "IMPORTANT: Only return the description text. Do not include quotes, formatting, or any text outside the description."
    ].filter(Boolean).join("\n");

    const prompt = promptParts;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional copywriter specializing in scientific and research industry content. Write clear, professional descriptions." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate description");
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error("No description generated");
    }

    console.log("Description generated successfully for vendor:", vendorName);

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate description" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
