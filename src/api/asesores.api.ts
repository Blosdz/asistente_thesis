import { apiRequest } from './client';

function buildQuery(params: Record<string, unknown> = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export const asesoresApi = {
  listar(params: Record<string, unknown> = {}) {
    return apiRequest(`/asesores${buildQuery(params)}`, { auth: false });
  },

  vincularPorSlug(slug: string, payload: Record<string, unknown> = {}) {
    return apiRequest('/asesores/vincular/slug', {
      method: 'POST',
      body: { ...payload, slug },
    });
  },

  vincularPorCodigo(codigo: string, payload: Record<string, unknown> = {}) {
    return apiRequest('/asesores/vincular/codigo', {
      method: 'POST',
      body: { ...payload, codigo },
    });
  },

  misAsesores() {
    return apiRequest('/asesores/mis-asesores');
  },

  estudiantes() {
    return apiRequest('/asesores/estudiantes');
  },

  generarCodigoPublico() {
    return apiRequest('/asesores/codigo-publico', {
      method: 'POST',
    });
  },

  miCodigoPublico() {
    return apiRequest('/asesores/mi-codigo-publico');
  },

  perfilPublico(asesorId: string) {
    return apiRequest(`/asesores/${asesorId}/perfil-publico`, { auth: false });
  },
};
