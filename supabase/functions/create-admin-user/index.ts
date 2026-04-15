import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminEmail = "acdigital.app@gmail.com";
    const adminPassword = "acdigital2026";

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === adminEmail);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password
      await supabase.auth.admin.updateUserById(userId, { password: adminPassword });
    } else {
      // Create user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Upsert admin_profiles
    const { error: profileError } = await supabase
      .from("admin_profiles")
      .upsert({
        id: userId,
        email: adminEmail,
        full_name: "AC Digital Admin",
        role: "admin",
        subscription_status: "active",
        subscription_plan: "lifetime",
        app_name: "Gestione Scadenze",
      }, { onConflict: "id" });

    if (profileError) throw profileError;

    // Ensure user_roles has admin
    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

    return new Response(
      JSON.stringify({ success: true, userId, message: existingUser ? "Admin updated" : "Admin created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
