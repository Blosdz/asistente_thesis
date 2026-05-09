import { apiRequest } from './client';

export const relacionesApi = {
  cambiarEstado(relacionId: string, estado: string) {
    return apiRequest(`/relaciones/${relacionId}/estado`, {
      method: 'PATCH',
      body: { estado },
    });
  },

  vincularPorSlug(slug: string, payload: unknown = {}) {
    return apiRequest(`/relaciones/asesor/slug/${slug}`, {
      method: 'POST',
      body: payload,
    });
  },

  vincularPorCodigo(codigo: string, payload: unknown = {}) {
    return apiRequest(`/relaciones/asesor/codigo/${codigo}`, {
      method: 'POST',
      body: payload,
    });
  },
};
