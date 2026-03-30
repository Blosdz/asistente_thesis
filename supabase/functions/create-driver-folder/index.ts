import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function normalizarNombre(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

async function getGoogleAccessToken() {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("OAuth secrets faltantes");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Error OAuth Google: ${JSON.stringify(json)}`);
  }

  return json.access_token as string;
}

async function crearFolderDrive(params: {
  folderName: string;
  parentFolderId: string;
  accessToken: string;
}) {
  const metadata = {
    name: params.folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [params.parentFolderId],
  };

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Error creando carpeta Drive: ${JSON.stringify(json)}`);
  }

  return json;
}

Deno.serve(async (req) => {
  try {
    const { tesis_id } = await req.json();

    if (!tesis_id) {
      return new Response(
        JSON.stringify({
          error: "tesis_id requerido",
        }),
        { status: 400 },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rootFolderId = Deno.env.get("GOOGLE_DRIVE_FOLDER_ID");

    if (!rootFolderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID no configurado");
    }

    const { data: tesis } = await supabase
      .schema("AT")
      .from("tesis")
      .select("id, titulo, estudiante_id")
      .eq("id", tesis_id)
      .single();

    if (!tesis) {
      throw new Error("tesis no encontrada");
    }

    if (tesis.carpeta_drive_id) {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "carpeta ya existe previamente",
        }),
      );
    }

    const { data: estudiante } = await supabase
      .schema("AT")
      .from("perfil_estudiante")
      .select("nombres, apellidos")
      .eq("estudiante_id", tesis.estudiante_id)
      .single();

    if (!estudiante) {
      throw new Error("estudiante no encontrado");
    }

    const studentName = normalizarNombre(
      `${estudiante.nombres}_${estudiante.apellidos}`,
    );

    const tesisTitle = normalizarNombre(tesis.titulo || "tesis");

    const folderName = `${studentName}_${tesisTitle}`;

    const accessToken = await getGoogleAccessToken();

    const driveFolder = await crearFolderDrive({
      folderName,
      parentFolderId: rootFolderId,
      accessToken,
    });

    await supabase
      .schema("AT")
      .from("tesis")
      .update({
        carpeta_drive_id: driveFolder.id,
      })
      .eq("id", tesis_id);

    return new Response(
      JSON.stringify({
        ok: true,
        folder_id: driveFolder.id,
        folder_name: folderName,
      }),
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "error desconocido",
      }),
      { status: 500 },
    );
  }
});
