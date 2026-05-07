import { apiRequest } from './client';

export const pagosApi = {
  listar() {
    return apiRequest('/pagos');
  },

  registrar(payload: unknown) {
    return apiRequest('/pagos', {
      method: 'POST',
      body: payload,
    });
  },

  registrarVoucher(id: string, payload: unknown) {
    return apiRequest(`/pagos/${id}/voucher`, {
      method: 'POST',
      body: payload,
    });
  },

  verificar(id: string, payload: unknown) {
    return apiRequest(`/pagos/${id}/verificar`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
