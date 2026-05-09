import { apiRequest } from './client';

export const pagosApi = {
  listar() {
    return apiRequest('/pagos/mis-pagos');
  },

  obtenerPlanes() {
    return apiRequest('/planes/disponibles', { auth: false });
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

  subirVoucher(id: string, formData: FormData) {
    return apiRequest(`/pagos/${id}/voucher/archivo`, {
      method: 'POST',
      body: formData,
    });
  },

  iniciarPagoPlan(payload: unknown) {
    return apiRequest('/pagos/plan/iniciar', {
      method: 'POST',
      body: payload,
    });
  },

  cotizar(payload: unknown) {
    return apiRequest('/planes/cotizar', {
      method: 'POST',
      body: payload,
      auth: false,
    });
  },
};
