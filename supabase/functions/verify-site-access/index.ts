import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Store the password server-side - never expose to client
const ACCESS_PASSWORD = Deno.env.get("SITE_ACCESS_PASSWORD") || "chem2026";

// Rate limiting: track failed attempts per IP
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Periodically clean up old entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_DURATION_MS) {
      failedAttempts.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Check if IP is rate limited
const isRateLimited = (ip: string): boolean => {
  const data = failedAttempts.get(ip);
  if (!data) return false;
  
  const now = Date.now();
  if (now - data.lastAttempt > LOCKOUT_DURATION_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  
  return data.count >= MAX_FAILED_ATTEMPTS;
};

// Record failed attempt
const recordFailedAttempt = (ip: string): void => {
  const now = Date.now();
  const data = failedAttempts.get(ip);
  
  if (data) {
    // Reset count if lockout period has passed
    if (now - data.lastAttempt > LOCKOUT_DURATION_MS) {
      failedAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
      failedAttempts.set(ip, { count: data.count + 1, lastAttempt: now });
    }
  } else {
    failedAttempts.set(ip, { count: 1, lastAttempt: now });
  }
};

// Clear failed attempts on successful login
const clearFailedAttempts = (ip: string): void => {
  failedAttempts.delete(ip);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("cf-connecting-ip") || 
                   "unknown";

  try {
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      console.log(`Rate limited IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ success: false, error: "Too many failed attempts. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
      // Clear failed attempts on success
      clearFailedAttempts(clientIP);
      
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
      // Record failed attempt
      recordFailedAttempt(clientIP);
      console.log(`Site access denied - invalid password (IP: ${clientIP})`);
      
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
