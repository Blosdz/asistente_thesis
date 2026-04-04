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
  const { data, error } = await atSchema().rpc('get_mis_tesis');

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
  if (modo === 'estudiante_documento' && !tipoDocumento) {
    throw new Error(
      'Se requiere tipo_documento cuando el modo es estudiante_documento',
    );
  }

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
  const { data, error } = await atSchema().rpc('get_estudiante_documentos', {
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error obteniendo documentos complementarios:', error);
    throw error;
  }

  return data ?? [];
}

export async function crearSugerenciaAsesor({
  tesisId,
  documentoTesisId,
  tipoSugerenciaId,
  detalle,
}) {
  const { data, error } = await atSchema().rpc('crear_sugerencia_asesor', {
    p_tesis_id: tesisId,
    p_documento_tesis_id: documentoTesisId ?? null,
    p_tipo_sugerencia_id: tipoSugerenciaId,
    p_detalle: detalle,
  });

  if (error) {
    console.error('Error creando sugerencia:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function obtenerSugerenciasMiTesis(tesisId) {
  const { data, error } = await atSchema().rpc('listar_sugerencias_tesis', {
    p_tesis_id: tesisId,
  });

  if (error) {
    console.error('Error obteniendo sugerencias:', error);
    throw error;
  }

  return data ?? [];
}

export async function marcarSugerenciaAplicadaEstudiante(
  sugerenciaId,
  comentarioEstudiante = null,
) {
  const { data, error } = await atSchema().rpc('marcar_sugerencia_aplicada', {
    p_historial_sugerencia_id: sugerenciaId,
    p_comentario_estudiante: comentarioEstudiante,
  });

  if (error) {
    console.error('Error marcando sugerencia como aplicada:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}
