import { apiRequest } from './client';

export const usuariosApi = {
  me() {
    return apiRequest('/usuarios/me');
  },

  guardarPerfilEstudiante(payload: unknown) {
    return apiRequest('/usuarios/perfil/estudiante', {
      method: 'PUT',
      body: payload,
    });
  },

  guardarPerfilAsesor(payload: unknown) {
    return apiRequest('/usuarios/perfil/asesor', {
      method: 'PUT',
      body: payload,
    });
  },
};
