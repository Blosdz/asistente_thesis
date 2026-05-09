import { apiRequest } from './client';

export const suscripcionesApi = {
  miSuscripcion() {
    return apiRequest('/suscripciones/mi-suscripcion');
  },

  estudiante(estudianteId: string) {
    return apiRequest(`/suscripciones/estudiante/${estudianteId}`);
  },
};
