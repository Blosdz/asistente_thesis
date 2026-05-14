import { catalogosApi } from '../api/catalogos.api';
import { obtenerUniversidadesLeads } from './leadService';

export async function obtenerUniversidades() {
  try {
    const data = await catalogosApi.listarUniversidades();
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
    if (Array.isArray(data?.universidades) && data.universidades.length > 0) {
      return data.universidades;
    }
    if (data && !Array.isArray(data)) return [data];
  } catch (error) {
    console.warn(
      'No se pudo cargar universidades desde el endpoint de catálogos.',
      error,
    );
  }

  try {
    const data = await obtenerUniversidadesLeads();
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(data?.data) && data.data.length > 0) return data.data;
    if (Array.isArray(data?.universidades) && data.universidades.length > 0) {
      return data.universidades;
    }
    if (data && !Array.isArray(data)) return [data];
  } catch (error) {
    console.warn('No se pudo cargar universidades desde el endpoint de leads.', error);
  }

  return [];
}

export async function obtenerEspecialidades() {
  try {
    const data = await catalogosApi.listarEspecialidades();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.especialidades)) return data.especialidades;
    return data ? [data] : [];
  } catch (error) {
    console.warn('No se pudo cargar especialidades desde NestJS.', error);
    return [];
  }
}
