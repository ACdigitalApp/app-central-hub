import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Validate JWT and check admin role
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Non autorizzato" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Token non valido" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin", { _user_id: userId });
  if (roleErr || !isAdmin) {
    return new Response(JSON.stringify({ error: "Accesso negato: ruolo admin richiesto" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profilePatch: Record<string, unknown> = { id: user_id };
    if (whatsapp_number !== undefined) profilePatch.whatsapp_number = whatsapp_number;
    if (notification_enabled !== undefined) profilePatch.notification_enabled = notification_enabled;
    if (subscription_plan !== undefined) profilePatch.subscription_plan = subscription_plan;
    if (subscription_status !== undefined) profilePatch.subscription_status = subscription_status;
    if (trial_end_date !== undefined) profilePatch.trial_end_date = trial_end_date || null;

    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(profilePatch, { onConflict: "id" });

    if (profileErr) {
      return new Response(JSON.stringify({ error: `profile: ${profileErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (role) {
      await admin.from("user_roles").delete().eq("user_id", user_id);
      const { error: insErr } = await admin.from("user_roles").insert({ user_id, role });
      if (insErr && !insErr.message.includes("duplicate")) {
        return new Response(JSON.stringify({ error: `role: ${insErr.message}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
