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
