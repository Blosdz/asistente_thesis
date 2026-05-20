import { apiRequest } from './client';

export const notificacionesApi = {
  listar() {
    return apiRequest('/notifications');
  },

  marcarLeida(notificationId: string) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  marcarTodasLeidas() {
    return apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};
