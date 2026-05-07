import { asesoresApi } from '../api/asesores.api';
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
  const [usuario, tesis, pagos, citas, asesores] = await Promise.all([
    usuariosApi.me(),
    tesisApi.listar(),
    pagosApi.listar(),
    reunionesApi.listar(),
    asesoresApi.listar(),
  ]);

  const tesisRows = asArray(tesis, 'tesis');
  const pagosRows = asArray(pagos, 'pagos');
  const citasRows = asArray(citas, 'reuniones');
  const asesoresRows = asArray(asesores, 'asesores');

  return {
    resumen: {
      total_tesis: tesisRows.length,
      total_pagos: pagosRows.length,
      total_citas: citasRows.length,
      total_asesores: asesoresRows.length,
    },
    perfil: unwrap(usuario),
    tesis: tesisRows,
    suscripcion: null,
    citas: citasRows,
    pagos: pagosRows,
    asesores: asesoresRows,
  };
}

export async function obtenerResumenDashboardEstudiante() {
  const dashboard = await obtenerDashboardEstudianteBase();
  return dashboard.resumen;
}

export async function obtenerMisCitasEstudiante({
  fechaInicio = null,
  fechaFin = null,
} = {}) {
  return asArray(await reunionesApi.listar({ fechaInicio, fechaFin }), 'reuniones');
}

export async function obtenerHistorialValidacionesCitaEstudiante() {
  pendingEndpoint('Historial de validaciones de cita del estudiante');
}

export async function obtenerDetalleCitaEstudiante() {
  pendingEndpoint('Detalle de cita de estudiante');
}

export async function cancelarCitaEstudiante(reunionId, motivo = null) {
  return unwrap(await reunionesApi.cancelar(reunionId, motivo));
}
