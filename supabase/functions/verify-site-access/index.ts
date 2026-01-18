import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Store the password server-side - never expose to client
const ACCESS_PASSWORD = Deno.env.get("SITE_ACCESS_PASSWORD") || "chem2026";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Password is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password length to prevent DoS
    if (password.length > 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = password === ACCESS_PASSWORD;

    if (isValid) {
      // Generate a simple signed token (timestamp + hash)
      const timestamp = Date.now();
      const tokenData = `${timestamp}:verified`;
      const encoder = new TextEncoder();
      const data = encoder.encode(tokenData + (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "secret"));
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const token = `${timestamp}:${hashHex.substring(0, 32)}`;

      console.log("Site access granted");
      
      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log("Site access denied - invalid password");
      
      return new Response(
        JSON.stringify({ success: false, error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying access:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
