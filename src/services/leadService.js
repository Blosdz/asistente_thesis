import { leadsApi } from '../api/leads.api';

const unwrap = (data) => data?.data || data?.lead || data;

export async function obtenerUniversidadesLeads() {
  return unwrap(await leadsApi.listarUniversidades());
}

export async function registrarLeadEstudiante(payload) {
  return unwrap(await leadsApi.registrarEstudiante(payload));
}
