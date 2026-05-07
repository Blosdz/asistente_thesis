import { apiRequest } from './client';

export const tesisApi = {
  listar() {
    return apiRequest('/tesis');
  },

  detalle(id: string) {
    return apiRequest(`/tesis/${id}`);
  },

  crear(payload: unknown) {
    return apiRequest('/tesis', {
      method: 'POST',
      body: payload,
    });
  },

  actualizarEstado(id: string, estado: string) {
    return apiRequest(`/tesis/${id}/estado`, {
      method: 'PATCH',
      body: { estado },
    });
  },
};
