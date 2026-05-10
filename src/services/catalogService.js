import { universities } from '../data/universities';
import { catalogosApi } from '../api/catalogos.api';

export async function obtenerUniversidades() {
  try {
    const data = await catalogosApi.listarUniversidades();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.universidades)) return data.universidades;
    return data ? [data] : [];
  } catch (error) {
    console.warn(
      'No se pudo cargar universidades desde NestJS. Usando fallback local.',
      error,
    );
    return universities;
  }
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
