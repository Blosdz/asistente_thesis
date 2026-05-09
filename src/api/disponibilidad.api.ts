import { apiRequest } from './client';

export const disponibilidadApi = {
  crear(payload: unknown) {
    return apiRequest('/disponibilidad', {
      method: 'POST',
      body: payload,
    });
  },

  misEspacios() {
    return apiRequest('/disponibilidad/mis-espacios');
  },

  desactivar(disponibilidadId: string) {
    return apiRequest(`/disponibilidad/${disponibilidadId}`, {
      method: 'DELETE',
    });
  },

  bloques(asesorId: string, { desde, hasta }: { desde: string; hasta: string }) {
    const params = new URLSearchParams({ desde, hasta });
    return apiRequest(`/disponibilidad/asesor/${asesorId}/bloques?${params}`, {
      auth: false,
    });
  },
};
