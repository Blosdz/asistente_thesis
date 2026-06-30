import { apiRequest } from './client';

export const catalogosApi = {
  listarUniversidades() {
    return apiRequest('/catalogos/universidades', { auth: false });
  },

  listarEspecialidades() {
    return apiRequest('/catalogos/especialidades', { auth: false });
  },

  obtenerTiposTesis() {
    return apiRequest('/catalogos/tipos-tesis', { auth: false });
  },

  obtenerFormatosTesis() {
    return apiRequest('/catalogos/doc-thesis-formats');
  },
};
