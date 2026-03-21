import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

// Crear una nueva tesis
export async function crearMiTesis(payload) {
  const { data, error } = await atSchema().rpc('crear_mi_tesis', {
    p_universidad_id: payload.universidad_id,
    p_titulo: payload.titulo,
    p_descripcion: payload.descripcion ?? null,
  });

  if (error) {
    console.error('Error creando tesis:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

// Obtener todas mis tesis
export async function obtenerMisTesis() {
  const { data, error } = await atSchema().rpc('obtener_mis_tesis');

  if (error) {
    console.error('Error obteniendo mis tesis:', error);
    throw error;
  }

  return data ?? [];
}

// Obtener documentos de una tesis específica
export async function obtenerDocumentosMiTesis(tesisId) {
  const { data, error } = await atSchema().rpc('obtener_documentos_mi_tesis', {
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error obteniendo documentos de mi tesis:', error);
    throw error;
  }

  return data ?? [];
}

// Subir documento (Manda a pre-firmada o edge function de Supabase Drive Proxy en el futuro)
export async function subirDocumentoAGoogleDrive({
  tesisId,
  file,
  modo = 'tesis',
  tipoDocumento = '',
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('tesis_id', tesisId);
  formData.append('modo', modo);
  if (tipoDocumento) {
    formData.append('tipo_documento', tipoDocumento);
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-thesis-document`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Failed to upload document to Edge Function',
    );
  }

  return await response.json();
}
export async function obtenerDocumentosComplementarios(tesisId) {
  const { data, error } = await atSchema()
    .from('estudiante_documentos')
    .select('*')
    .eq('tesis_id', tesisId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error('Error obteniendo documentos complementarios:', error);
    throw error;
  }

  return data ?? [];
}
