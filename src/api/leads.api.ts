import { apiRequest } from './client';

export const leadsApi = {
  listarUniversidades() {
    return apiRequest('/leads/universidades', { auth: false });
  },

  registrarEstudiante(payload: unknown) {
    return apiRequest('/leads/estudiante', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },
};
