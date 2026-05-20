import { apiRequest } from './client';

export const usuariosApi = {
  me() {
    return apiRequest('/auth/me');
  },

  obtenerPerfilEstudiante() {
    return apiRequest('/perfil');
  },

  obtenerPerfilAsesor() {
    return apiRequest('/perfil');
  },

  guardarPerfilEstudiante(payload: unknown) {
    return apiRequest('/perfil', {
      method: 'PUT',
      body: payload,
    });
  },

  guardarPerfilAsesor(payload: unknown) {
    return apiRequest('/perfil', {
      method: 'PUT',
      body: payload,
    });
  },

  subirFotoPerfil(payload: FormData) {
    return apiRequest('/perfil/foto', {
      method: 'POST',
      body: payload,
    });
  },
};
