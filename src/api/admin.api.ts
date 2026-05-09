import { apiRequest } from './client';

export const adminApi = {
  listarUsuarios() {
    return apiRequest('/admin/usuarios');
  },

  listarPagos() {
    return apiRequest('/admin/pagos');
  },

  pagosPendientesRevision() {
    return apiRequest('/admin/pagos/pendientes-revision');
  },

  obtenerPago(pagoId: string) {
    return apiRequest(`/admin/pagos/${pagoId}`);
  },

  verificarPago(pagoId: string, payload: unknown) {
    return apiRequest(`/admin/pagos/${pagoId}/verificar`, {
      method: 'PATCH',
      body: payload,
    });
  },

  verificarPagoPlan(pagoId: string, payload: unknown) {
    return apiRequest(`/admin/pagos/${pagoId}/verificar-plan`, {
      method: 'PATCH',
      body: payload,
    });
  },

  actualizarEstadoReunion(reunionId: string, payload: unknown) {
    return apiRequest(`/admin/reuniones/${reunionId}/estado`, {
      method: 'PATCH',
      body: payload,
    });
  },

  verificarPagoReunion(reunionId: string, payload: unknown) {
    return apiRequest(`/admin/reuniones/${reunionId}/pago/verificar`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
