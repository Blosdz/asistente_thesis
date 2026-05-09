import { apiRequest } from './client';

export const tesisApi = {
  listar() {
    return apiRequest('/tesis/mis-tesis');
  },

  listarConAsesores() {
    return apiRequest('/tesis/mis-tesis-con-asesores');
  },

  listarAsignadasAsesor() {
    return apiRequest('/tesis/asignadas-asesor');
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

  crearConPlan(payload: unknown) {
    return apiRequest('/tesis/con-plan', {
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

  asignarAsesor(id: string, payload: unknown) {
    return apiRequest(`/tesis/${id}/asignar-asesor`, {
      method: 'POST',
      body: payload,
    });
  },
};
