import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ADMIN_ID = "ADITYA78";
const ADMIN_PASSWORD = "2175";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-id, x-admin-password",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const id = req.headers.get("x-admin-id");
  const pw = req.headers.get("x-admin-password");

  if (id !== ADMIN_ID || pw !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: logins, error } = await supabase
    .from("login_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ logins }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
