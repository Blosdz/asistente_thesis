import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function normalizarNombre(nombre: string) {
  return nombre.trim().replace(/\s+/g, " ").slice(0, 160);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY",
        }),
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await req.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const name = normalizarNombre(String(body?.name ?? ""));
    const rol = body?.rol === "asesor" ? "asesor" : "estudiante";

    if (!email || !name) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "email y name son obligatorios",
        }),
        { status: 400, headers: corsHeaders },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: existente, error: existenteError } = await supabaseAdmin
      .schema("AT")
      .from("invitaciones_pendientes")
      .select("id, email, estado, intentos")
      .eq("email", email)
      .in("estado", ["pendiente", "link_generado"])
      .order("creado_en", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existenteError) {
      throw existenteError;
    }

    const payload = {
      email,
      user_metadata: {
        rol,
        nombre: name,
        name,
      },
    };

    if (existente?.id) {
      const { error: updateError } = await supabaseAdmin
        .schema("AT")
        .from("invitaciones_pendientes")
        .update({
          nombre: name,
          payload,
          estado: "pendiente",
          ultimo_error: null,
          actualizado_en: new Date().toISOString(),
        })
        .eq("id", existente.id);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          ok: true,
          queued: true,
          id: existente.id,
          estado: "pendiente",
        }),
        { status: 200, headers: corsHeaders },
      );
    }

    const { data: creada, error: insertError } = await supabaseAdmin
      .schema("AT")
      .from("invitaciones_pendientes")
      .insert({
        email,
        nombre: name,
        payload,
        estado: "pendiente",
        intentos: 0,
        creado_en: new Date().toISOString(),
        actualizado_en: new Date().toISOString(),
      })
      .select("id, estado")
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        queued: true,
        id: creada.id,
        estado: creada.estado,
      }),
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
