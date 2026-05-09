import { apiRequest } from './client';

export const observacionesApi = {
  crear(payload: unknown) {
    return apiRequest('/observaciones/tesis', {
      method: 'POST',
      body: payload,
    });
  },

  historial(tesisId: string) {
    return apiRequest(`/observaciones/tesis/${tesisId}/historial`);
  },
};
