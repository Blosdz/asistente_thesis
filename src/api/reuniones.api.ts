import { apiRequest } from './client';

export const reunionesApi = {
  listar({ fechaInicio = null, fechaFin = null } = {}) {
    const params = new URLSearchParams();
    if (fechaInicio) params.set('fechaInicio', fechaInicio);
    if (fechaFin) params.set('fechaFin', fechaFin);
    const query = params.toString();
    return apiRequest(`/reuniones${query ? `?${query}` : ''}`);
  },

  crear(payload: unknown) {
    return apiRequest('/reuniones', {
      method: 'POST',
      body: payload,
    });
  },

  cancelar(id: string, motivo: string | null = null) {
    return apiRequest(`/reuniones/${id}/cancelar`, {
      method: 'PATCH',
      body: { motivo },
    });
  },
};
