import { asesoresApi } from '../api/asesores.api';
import { dashboardApi } from '../api/dashboard.api';
import { pagosApi } from '../api/pagos.api';
import { pendingEndpoint } from '../api/client';
import { reunionesApi } from '../api/reuniones.api';
import { tesisApi } from '../api/tesis.api';
import { usuariosApi } from '../api/usuarios.api';

const asArray = (data, key = null) => {
  if (Array.isArray(data)) return data;
  if (key && Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
};

const unwrap = (data) => data?.data || data?.usuario || data;

export async function obtenerDashboardEstudianteBase() {
  const dashboard = await dashboardApi.estudiante();
  return dashboard?.data || dashboard;
}

export async function obtenerDashboardEstudianteBaseLegacy() {
  const [usuario, tesis, pagos, citas, validacionesCita, asesores] = await Promise.all([
    usuariosApi.me(),
    tesisApi.listar(),
    pagosApi.listar(),
    reunionesApi.listarEstudiante(),
    reunionesApi.listarValidacionesEstudiante(),
    asesoresApi.listar(),
  ]);

  const tesisRows = asArray(tesis, 'tesis');
  const pagosRows = asArray(pagos, 'pagos');
  const reunionesRows = asArray(citas, 'reuniones');
  const validacionesRows = asArray(validacionesCita, 'data');
  const citasRows = mergeCitas(reunionesRows, validacionesRows);
  const asesoresRows = asArray(asesores, 'asesores');
  const now = Date.now();
  const citasProximas = citasRows.filter((cita) => {
    const inicio = cita.inicio || cita.start_at || cita.inicio_reunion;
    return inicio && !Number.isNaN(new Date(inicio).getTime()) && new Date(inicio).getTime() >= now;
  });
  const proximaCita = citasProximas
    .slice()
    .sort((a, b) => {
      const inicioA = a.inicio || a.start_at || a.inicio_reunion;
      const inicioB = b.inicio || b.start_at || b.inicio_reunion;
      return new Date(inicioA) - new Date(inicioB);
    })[0];
  const pagosPendientes = pagosRows.filter((pago) =>
    ['pendiente', 'voucher_subido', 'rechazado'].includes(
      String(pago.estado_pago || pago.estado || '').toLowerCase(),
    ),
  );

  return {
    resumen: {
      total_tesis: tesisRows.length,
      total_pagos: pagosRows.length,
      total_citas: citasRows.length,
      total_asesores: asesoresRows.length,
      cantidad_citas_proximas: citasProximas.length,
      pagos_pendientes: pagosPendientes.length,
      proxima_reunion_id:
        proximaCita?.reunion_id || proximaCita?.meeting_id || proximaCita?.id || null,
      proxima_reunion_inicio:
        proximaCita?.inicio || proximaCita?.start_at || proximaCita?.inicio_reunion || null,
      proxima_reunion_fin:
        proximaCita?.fin || proximaCita?.end_at || proximaCita?.fin_reunion || null,
      proxima_reunion_estado:
        proximaCita?.estado || proximaCita?.status || proximaCita?.estado_reunion || null,
      proxima_reunion_enlace:
        proximaCita?.enlace_reunion || proximaCita?.meet_link || proximaCita?.enlace || null,
      proximo_asesor_id: proximaCita?.asesor_id || proximaCita?.advisor_id || null,
      proximo_asesor_nombre:
        proximaCita?.asesor_nombre || proximaCita?.advisor_nombre || proximaCita?.nombre_mostrar || null,
    },
    perfil: unwrap(usuario),
    tesis: tesisRows,
    suscripcion: null,
    citas: citasRows,
    pagos: pagosRows,
    asesores: asesoresRows,
  };
}

function mergeCitas(reunionesRows, validacionesRows) {
  const byKey = new Map();

  [...reunionesRows, ...validacionesRows].forEach((cita) => {
    const key =
      cita.reunion_id ||
      cita.meeting_id ||
      cita.id ||
      cita.validation_cita_id ||
      `${cita.start_at || cita.inicio}-${cita.advisor_id || cita.asesor_id}`;

    if (!key) return;

    const existing = byKey.get(key);
    byKey.set(key, { ...(existing || {}), ...cita });
  });

  return Array.from(byKey.values());
}

export async function obtenerResumenDashboardEstudiante() {
  const dashboard = await obtenerDashboardEstudianteBase();
  return dashboard.resumen;
}

export async function obtenerMisCitasEstudiante({
  fechaInicio = null,
  fechaFin = null,
} = {}) {
  const citas = asArray(await reunionesApi.listarEstudiante(), 'reuniones');
  return citas.filter((cita) => {
    const inicio = new Date(cita.inicio);
    if (fechaInicio && inicio < new Date(fechaInicio)) return false;
    if (fechaFin && inicio > new Date(fechaFin)) return false;
    return true;
  });
}

export async function obtenerHistorialValidacionesCitaEstudiante() {
  return asArray(await reunionesApi.listarValidacionesEstudiante(), 'data');
}

export async function obtenerDetalleCitaEstudiante() {
  pendingEndpoint('Detalle de cita de estudiante sin reunionId');
}

export async function cancelarCitaEstudiante(reunionId, motivo = null) {
  return unwrap(await reunionesApi.cancelar(reunionId, motivo));
}
