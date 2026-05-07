import { apiRequest } from './client';

export const asesoresApi = {
  listar() {
    return apiRequest('/asesores', { auth: false });
  },
};
