import { apiRequest } from './client';

export const asesoresApi = {
  listar() {
    return apiRequest('/asesores', { auth: false });
  },

  misAsesores() {
    return apiRequest('/asesores/mis-asesores');
  },

  estudiantes() {
    return apiRequest('/asesores/estudiantes');
  },

  generarCodigoPublico() {
    return apiRequest('/asesores/codigo-publico', {
      method: 'POST',
    });
  },

  miCodigoPublico() {
    return apiRequest('/asesores/mi-codigo-publico');
  },

  perfilPublico(asesorId: string) {
    return apiRequest(`/asesores/${asesorId}/perfil-publico`, { auth: false });
  },
};
