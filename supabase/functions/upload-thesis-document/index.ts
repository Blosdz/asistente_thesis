import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function getGoogleAccessToken() {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Faltan GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN',
    );
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
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
    'https://www.googleapis.com/drive/v3/about?fields=user',
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
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${params.file.type || 'application/octet-stream'}\r\n\r\n`;

  const body = new Blob([preamble, fileBuffer, closeDelimiter]);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,parents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Falta Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!supabaseUrl || !serviceRoleKey || !folderId) {
      return new Response(
        JSON.stringify({
          error: 'Faltan secretos del entorno',
          debug: {
            hasSupabaseUrl: !!supabaseUrl,
            hasServiceRoleKey: !!serviceRoleKey,
            hasFolderId: !!folderId,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: 'Usuario no autenticado',
          debug: { userError },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const formData = await req.formData();
    const tesisId = formData.get('tesis_id')?.toString();
    const file = formData.get('file');
    const modo = formData.get('modo')?.toString() || 'tesis';
    const tipoDocumento = formData.get('tipo_documento')?.toString();

    if (!tesisId || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'Se requiere tesis_id y file' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (modo === 'estudiante_documento' && !tipoDocumento) {
      return new Response(
        JSON.stringify({
          error:
            'Se requiere tipo_documento cuando el modo es estudiante_documento',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: usuarioAT, error: usuarioATError } = await supabaseAdmin
      .schema('AT')
      .from('usuarios')
      .select('id, rol, auth_usuario_id')
      .eq('auth_usuario_id', user.id)
      .maybeSingle();

    if (usuarioATError || !usuarioAT || usuarioAT.rol !== 'estudiante') {
      return new Response(
        JSON.stringify({
          error: 'Usuario AT inválido o no es estudiante',
          debug: {
            auth_user_id: user.id,
            usuarioAT,
            usuarioATError,
          },
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: tesis, error: tesisError } = await supabaseAdmin
      .schema('AT')
      .from('tesis')
      .select('id, estudiante_id, titulo')
      .eq('id', tesisId)
      .eq('estudiante_id', usuarioAT.id)
      .is('eliminado_en', null)
      .maybeSingle();

    if (tesisError || !tesis) {
      return new Response(
        JSON.stringify({
          error: 'La tesis no existe o no pertenece al usuario',
          debug: {
            tesisId,
            estudiante_id_buscado: usuarioAT.id,
            tesisError,
          },
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    let nextVersion = 1;

    if (modo === 'tesis') {
      const { data: ultimoDoc } = await supabaseAdmin
        .schema('AT')
        .from('documentos_tesis')
        .select('version')
        .eq('tesis_id', tesisId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      nextVersion = (ultimoDoc?.version ?? 0) + 1;
    }

    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const safeTitle = (tesis.titulo || 'tesis')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .slice(0, 80);

    const suffix = modo === 'tesis' ? `_v${nextVersion}` : `_${tipoDocumento}`;
    const driveFileName = `${safeTitle}${suffix}.${ext}`;

    const accessToken = await getGoogleAccessToken();

    // Debug útil: confirma que realmente estás autenticando como cuenta humana
    const driveUser = await getGoogleDriveUser(accessToken);

    const driveFile = await uploadFileToDrive({
      file,
      folderId,
      accessToken,
      fileName: driveFileName,
    });

    let inserted: unknown = null;
    let insertError: { message?: string } | null = null;

    if (modo === 'tesis') {
      const result = await supabaseAdmin
        .schema('AT')
        .from('documentos_tesis')
        .insert({
          tesis_id: tesisId,
          subido_por: usuarioAT.id,
          nombre_archivo: file.name,
          url_archivo_drive: driveFile.webViewLink ?? null,
          carpeta_drive_id: folderId,
          documento_drive_id: driveFile.id,
          version: nextVersion,
          estado_revision: 'pendiente',
          comentario_revision: null,
          tipo_mime: file.type || driveFile.mimeType || null,
          tamano_bytes: file.size,
        })
        .select()
        .single();

      inserted = result.data;
      insertError = result.error;
    } else {
      const result = await supabaseAdmin
        .schema('AT')
        .from('estudiante_documentos')
        .insert({
          thesis_id: tesisId,
          nombre: file.name,
          tipo: tipoDocumento,
          url_google_doc: driveFile.webViewLink ?? null,
          activo: true,
          creado_por: usuarioAT.id,
        })
        .select()
        .single();

      inserted = result.data;
      insertError = result.error;
    }

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: 'Archivo subido a Drive pero falló el registro en BD',
          details: insertError.message,
          drive_file_id: driveFile.id,
          drive_user: driveUser,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Documento subido correctamente',
        data: inserted,
        drive: {
          id: driveFile.id,
          webViewLink: driveFile.webViewLink ?? null,
          webContentLink: driveFile.webContentLink ?? null,
        },
        drive_user: driveUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
