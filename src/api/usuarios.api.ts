import { apiRequest } from './client';

export const usuariosApi = {
  me() {
    return apiRequest('/auth/me');
  },

  obtenerPerfilEstudiante() {
    return apiRequest('/perfil/estudiante');
  },

  obtenerPerfilAsesor() {
    return apiRequest('/perfil/asesor');
  },

  guardarPerfilEstudiante(payload: unknown) {
    return apiRequest('/perfil/estudiante', {
      method: 'PUT',
      body: payload,
    });
  },

  guardarPerfilAsesor(payload: unknown) {
    return apiRequest('/perfil/asesor', {
      method: 'PUT',
      body: payload,
    });
  },
};
