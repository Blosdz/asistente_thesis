import { apiRequest } from './client';

export const sugerenciasApi = {
  crear(payload: unknown) {
    return apiRequest('/sugerencias', {
      method: 'POST',
      body: payload,
    });
  },

  listarPorTesis(tesisId: string) {
    return apiRequest(`/sugerencias/tesis/${tesisId}`);
  },

  listarValidacion(tesisId: string) {
    return apiRequest(`/sugerencias/tesis/${tesisId}/validacion`);
  },

  tipos() {
    return apiRequest('/sugerencias/tipos');
  },

  marcarAplicada(sugerenciaId: string, payload: unknown) {
    return apiRequest(`/sugerencias/${sugerenciaId}/aplicada`, {
      method: 'PATCH',
      body: payload,
    });
  },

  actualizarEstado(sugerenciaId: string, payload: unknown) {
    return apiRequest(`/sugerencias/${sugerenciaId}/estado`, {
      method: 'PATCH',
      body: payload,
    });
  },

  log(sugerenciaId: string) {
    return apiRequest(`/sugerencias/${sugerenciaId}/log`);
  },
};
