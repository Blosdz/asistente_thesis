import { apiRequest } from './client';

export const documentosApi = {
  listarPorTesis(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}`);
  },

  listarPorTesisAsignada(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}/asignada`);
  },

  listarApoyo(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}/apoyo`);
  },

  crearCarpetaDrive(tesisId: string) {
    return apiRequest(`/documentos/tesis/${tesisId}/carpeta-drive`, {
      method: 'POST',
    });
  },

  subirArchivo(tesisId: string, formData: FormData) {
    return apiRequest(`/documentos/tesis/${tesisId}/archivo`, {
      method: 'POST',
      body: formData,
    });
  },

  registrar(payload: unknown) {
    return apiRequest('/documentos/tesis', {
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
