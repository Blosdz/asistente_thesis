import { apiRequest } from './client';

export const leadsApi = {
  registrarEstudiante(payload: unknown) {
    return apiRequest('/leads/estudiante', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },
};
