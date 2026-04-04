import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

export async function obtenerResumenDashboardEstudiante() {
  const { data, error } = await atSchema().rpc(
    'obtener_resumen_dashboard_estudiante',
  );

  if (error) {
    console.error('Error obteniendo resumen del dashboard:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function obtenerMisCitasEstudiante({
  fechaInicio = null,
  fechaFin = null,
} = {}) {
  const { data, error } = await atSchema().rpc('obtener_mis_citas_estudiante', {
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  });

  if (error) {
    console.error('Error obteniendo mis citas:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerHistorialValidacionesCitaEstudiante(
  status = null,
) {
  const { data, error } = await atSchema().rpc(
    'obtener_historial_validaciones_cita_estudiante',
    {
      p_status: status,
    },
  );

  if (error) {
    console.error('Error obteniendo historial de solicitudes de cita:', error);
    throw error;
  }

  return data ?? [];
}

export async function obtenerDetalleCitaEstudiante(reunionId) {
  const { data, error } = await atSchema().rpc(
    'obtener_detalle_cita_estudiante',
    {
      p_reunion_id: reunionId,
    },
  );

  if (error) {
    console.error('Error obteniendo detalle de la cita:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}

export async function cancelarCitaEstudiante(reunionId, motivo = null) {
  const { data, error } = await atSchema().rpc('cancelar_cita_estudiante', {
    p_reunion_id: reunionId,
    p_motivo: motivo,
  });

  if (error) {
    console.error('Error cancelando cita:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}
