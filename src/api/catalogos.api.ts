import { apiRequest } from './client';

export const catalogosApi = {
  listarUniversidades() {
    return apiRequest('/catalogos/universidades', { auth: false });
  },

  obtenerTiposTesis() {
    return apiRequest('/catalogos/tipos-tesis', { auth: false });
  },
};
