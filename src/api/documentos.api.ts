import { apiRequest } from './client';

export const documentosApi = {
  listarPorTesis(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}`);
  },

  registrar(payload: unknown) {
    return apiRequest('/documentos', {
      method: 'POST',
      body: payload,
    });
  },

  actualizarRevision(id: string, payload: unknown) {
    return apiRequest(`/documentos/${id}/revision`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
