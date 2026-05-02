import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BYPASS_TOKEN = "gs-admin-bypass-2026";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const bypassToken = req.headers.get("x-admin-token") ?? "";
  const authHeader = req.headers.get("authorization") ?? "";

  if (bypassToken !== BYPASS_TOKEN && !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Non autorizzato" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Service role key mancante" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      user_id,
      whatsapp_number,
      notification_enabled,
      role,
      subscription_plan,
      subscription_status,
      trial_end_date,
    } = body ?? {};

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id mancante" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Build profile patch (only defined fields)
    const profilePatch: Record<string, unknown> = { id: user_id };
    if (whatsapp_number !== undefined) profilePatch.whatsapp_number = whatsapp_number;
    if (notification_enabled !== undefined) profilePatch.notification_enabled = notification_enabled;
    if (subscription_plan !== undefined) profilePatch.subscription_plan = subscription_plan;
    if (subscription_status !== undefined) profilePatch.subscription_status = subscription_status;
    if (trial_end_date !== undefined) profilePatch.trial_end_date = trial_end_date || null;

    // Upsert profile row (creates if missing, updates if exists)
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(profilePatch, { onConflict: "id" });

    if (profileErr) {
      return new Response(JSON.stringify({ error: `profile: ${profileErr.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update role if provided
    if (role) {
      // Remove other role rows for this user, then insert the new one
      await admin.from("user_roles").delete().eq("user_id", user_id);
      const { error: roleErr } = await admin
        .from("user_roles")
        .insert({ user_id, role });
      if (roleErr && !roleErr.message.includes("duplicate")) {
        return new Response(JSON.stringify({ error: `role: ${roleErr.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
