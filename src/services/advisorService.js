import { supabase } from '../lib/supabase';

// Helper for schema
const atSchema = () => supabase.schema('AT');

export async function obtenerAsesores() {
  const { data, error } = await atSchema().rpc('obtener_asesores');

  if (error) {
    console.error('Error obteniendo asesores:', error);
    throw error;
  }

  return data ?? [];
}

export async function vincularmeConAsesorPorSlug(slug) {
  const { data, error } = await atSchema().rpc('vincularme_con_asesor_por_slug', {
    p_slug: slug,
  });

  if (error) {
    console.error('Error vinculando con asesor por slug:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function vincularmeConAsesorPorCodigo(codigo) {
  const { data, error } = await atSchema().rpc('vincularme_con_asesor_por_codigo', {
    p_codigo: codigo,
  });

  if (error) {
    console.error('Error vinculando con asesor por código:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function generarCodigoAsesor() {
  const { data, error } = await atSchema().rpc('generar_codigo_publico_asesor');

  if (error) {
    console.error('Error generando código del asesor:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function obtenerMiCodigoPublicoAsesor() {
  const { data, error } = await atSchema().rpc('obtener_mi_codigo_publico_asesor');

  if (error) {
    console.error('Error obteniendo mi código público de asesor:', error);
    throw error;
  }

  return data?.[0] ?? null;
}

export async function crearScheduleAsesor(params) {
  const { data, error } = await atSchema().rpc('crear_schedule_asesor', params);
  
  if (error) {
    console.error('Error creando schedule de asesor:', error);
    throw error;
  }

  return data;
}

export async function obtenerBloquesDisponibles(asesorId, desde, hasta) {
  const { data, error } = await atSchema().rpc('obtener_bloques_disponibles_asesor', {
    p_asesor_id: asesorId,
    p_desde: desde,
    p_hasta: hasta,
  });

  if (error) {
    console.error('Error obteniendo bloques disponibles:', error);
    throw error;
  }

  return data ?? [];
}

export async function crearCitaEstudianteAsesor(params) {
  const { data, error } = await atSchema().rpc('crear_cita_estudiante_asesor', params);

  if (error) {
    console.error('Error creando cita:', error);
    throw error;
  }

  return data;
}
