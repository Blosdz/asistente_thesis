import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

export async function obtenerPlanesDisponibles() {
  const { data, error } = await atSchema().rpc('fn_planes_disponibles');
  if (error) {
    console.error('Error obteniendo planes:', error);
    throw error;
  }
  return data ?? [];
}

export async function iniciarPagoPlan({ pagadorId, planId }) {
  const { data, error } = await atSchema().rpc('fn_iniciar_pago_plan', {
    pagador_id: pagadorId,
    plan_id: planId,
  });
  if (error) {
    console.error('Error iniciando pago de plan:', error);
    throw error;
  }
  // RPC returns { pago_id, monto, estado }
  return Array.isArray(data) ? data[0] : data;
}

export async function obtenerMisPagosEstudiante() {
  const { data, error } = await atSchema().rpc('obtener_mis_pagos_estudiante');

  if (error) {
    console.error('Error obteniendo mis pagos:', error);
    throw error;
  }

  return data ?? [];
}

export async function registrarVoucherPago({
  pagoId,
  driveId,
  driveUrl,
  nombreArchivo,
  tipoMime,
  tamanoBytes,
}) {
  const { data, error } = await atSchema().rpc('subir_voucher_pago', {
    p_pago_id: pagoId,
    p_documento_drive_id: driveId,
    p_url_archivo_drive: driveUrl,
    p_nombre_archivo_voucher: nombreArchivo ?? null,
    p_tipo_mime_voucher: tipoMime ?? null,
    p_tamano_bytes_voucher: tamanoBytes ?? null,
  });

  if (error) {
    console.error('Error registrando voucher:', error);
    throw error;
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function subirVoucherPago({ pagoId, file }) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Usuario no autenticado');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pago_id', pagoId);

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subir-vouchers`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    },
  );

  const uploadData = await response.json();

  if (!response.ok) {
    throw new Error(uploadData.error || 'No se pudo subir el voucher');
  }

  return uploadData;
}

export async function disponibilidadAsesorSemana({ asesorId, desde, hasta }) {
  const { data, error } = await atSchema().rpc('fn_disponibilidad_asesor_semana', {
    p_asesor: asesorId,
    desde,
    hasta,
  });
  if (error) {
    console.error('Error obteniendo disponibilidad:', error);
    throw error;
  }
  return data ?? [];
}

export async function reservarReunion({ disponibilidadId, asesorId, estudianteId, tesisId = null, motivo = '', modalidad = 'virtual' }) {
  const { data, error } = await atSchema().rpc('fn_reservar_reunion', {
    p_disponibilidad: disponibilidadId,
    p_asesor: asesorId,
    p_estudiante: estudianteId,
    p_tesis: tesisId,
    p_motivo: motivo || null,
    p_modalidad: modalidad,
  });
  if (error) {
    console.error('Error reservando reunión:', error);
    throw error;
  }
  // RPC returns { reunion_id, pago_id, enlace, estado }
  return Array.isArray(data) ? data[0] : data;
}
