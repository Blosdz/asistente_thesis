import "@supabase/functions-js/edge-runtime.d.ts";
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

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function getGoogleAccessToken() {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_OAUTH_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Faltan GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET o GOOGLE_OAUTH_REFRESH_TOKEN",
    );
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
    throw new Error(
      `Error obteniendo access token de Google: ${JSON.stringify(json)}`,
    );
  }

  return json.access_token as string;
}

async function getGoogleDriveUser(accessToken: string) {
  const res = await fetch(
    "https://www.googleapis.com/drive/v3/about?fields=user",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      `Error consultando usuario de Drive: ${JSON.stringify(json)}`,
    );
  }

  return json;
}

async function buscarFolderDrive(params: {
  folderName: string;
  parentFolderId: string;
  accessToken: string;
}) {
  const query =
    `'${escapeDriveQueryValue(params.parentFolderId)}' in parents and ` +
    `mimeType = 'application/vnd.google-apps.folder' and trashed = false and ` +
    `name = '${escapeDriveQueryValue(params.folderName)}'`;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    },
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Error buscando carpeta Drive: ${JSON.stringify(json)}`);
  }

  return json.files?.[0] ?? null;
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

async function obtenerOCrearFolderDrive(params: {
  folderName: string;
  parentFolderId: string;
  accessToken: string;
}) {
  const existing = await buscarFolderDrive(params);
  if (existing) return existing;
  return await crearFolderDrive(params);
}

async function uploadFileToDrive(params: {
  file: File;
  folderId: string;
  accessToken: string;
  fileName: string;
}) {
  const metadata = {
    name: params.fileName,
    parents: [params.folderId],
  };

  const boundary = `foo_bar_baz_${crypto.randomUUID()}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileBuffer = new Uint8Array(await params.file.arrayBuffer());
  const preamble =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${params.file.type || "application/octet-stream"}\r\n\r\n`;

  const body = new Blob([preamble, fileBuffer, closeDelimiter]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,parents",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error subiendo archivo a Google Drive: ${txt}`);
  }

  return await res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Falta Authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const rootFolderId =
      Deno.env.get("GOOGLE_DRIVE_VOUCHERS_FOLDER_ID") ||
      Deno.env.get("GOOGLE_DRIVE_FOLDER_ID");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Faltan secretos del entorno",
          debug: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceRoleKey: !!serviceRoleKey,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!rootFolderId) {
      return new Response(
        JSON.stringify({
          error:
            "Falta GOOGLE_DRIVE_VOUCHERS_FOLDER_ID o GOOGLE_DRIVE_FOLDER_ID",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Usuario no autenticado",
          debug: { userError },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const formData = await req.formData();
    const pagoId = formData.get("pago_id")?.toString();
    const file = formData.get("file");

    if (!pagoId || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "Se requiere pago_id y file" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: usuarioAT, error: usuarioATError } = await supabaseAdmin
      .schema("AT")
      .from("usuarios")
      .select("id, rol, auth_usuario_id")
      .eq("auth_usuario_id", user.id)
      .maybeSingle();

    if (usuarioATError || !usuarioAT || usuarioAT.rol !== "estudiante") {
      return new Response(
        JSON.stringify({
          error: "Usuario AT inválido o no es estudiante",
          debug: {
            auth_user_id: user.id,
            usuarioAT,
            usuarioATError,
          },
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: pago, error: pagoError } = await supabaseAdmin
      .schema("AT")
      .from("pagos")
      .select("id, pagador_id, concepto, estado")
      .eq("id", pagoId)
      .maybeSingle();

    if (pagoError || !pago) {
      return new Response(
        JSON.stringify({
          error: "No se encontró el pago",
          debug: { pagoError, pagoId },
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (pago.pagador_id !== usuarioAT.id) {
      return new Response(
        JSON.stringify({
          error: "No tienes permiso para subir voucher a este pago",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { data: perfilEstudiante } = await supabaseAdmin
      .schema("AT")
      .from("perfil_estudiante")
      .select("nombres, apellidos")
      .eq("estudiante_id", usuarioAT.id)
      .maybeSingle();

    const studentFolderName = normalizarNombre(
      perfilEstudiante?.nombres || perfilEstudiante?.apellidos
        ? `${perfilEstudiante?.nombres || ""}_${perfilEstudiante?.apellidos || ""}`
        : `usuario_${usuarioAT.id.slice(0, 8)}`,
    );

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const safeConcept = normalizarNombre(pago.concepto || "voucher_pago");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const driveFileName =
      `${safeConcept}_${pago.id.slice(0, 8)}_${stamp}.${ext}`;

    const accessToken = await getGoogleAccessToken();
    const driveUser = await getGoogleDriveUser(accessToken);
    const studentFolder = await obtenerOCrearFolderDrive({
      folderName: studentFolderName,
      parentFolderId: rootFolderId,
      accessToken,
    });

    const driveFile = await uploadFileToDrive({
      file,
      folderId: studentFolder.id,
      accessToken,
      fileName: driveFileName,
    });

    const nowIso = new Date().toISOString();
    const voucherUrl =
      driveFile.webViewLink ?? driveFile.webContentLink ?? null;

    const { error: updatePagoError } = await supabaseAdmin
      .schema("AT")
      .from("pagos")
      .update({
        documento_drive_id: driveFile.id,
        url_archivo_drive: voucherUrl,
        nombre_archivo_voucher: file.name,
        tipo_mime_voucher: file.type || driveFile.mimeType || null,
        tamano_bytes_voucher: file.size,
        subido_en: nowIso,
        estado: "voucher_subido",
        actualizado_en: nowIso,
      })
      .eq("id", pago.id);

    if (updatePagoError) {
      return new Response(
        JSON.stringify({
          error:
            "El archivo se subió a Drive pero falló la actualización del pago",
          debug: { updatePagoError, pagoId: pago.id, driveFileId: driveFile.id },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Voucher subido correctamente",
        pago_id: pago.id,
        estado: "voucher_subido",
        folder: {
          id: studentFolder.id,
          name: studentFolder.name,
        },
        file: {
          original_name: file.name,
          stored_name: driveFileName,
          mime_type: file.type || driveFile.mimeType || null,
          size: file.size,
        },
        drive: {
          id: driveFile.id,
          webViewLink: voucherUrl,
          webContentLink: driveFile.webContentLink ?? null,
        },
        drive_user: driveUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
