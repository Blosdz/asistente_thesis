import { apiRequest } from './client';

export const reunionesApi = {
  listarEstudiante() {
    return apiRequest('/reuniones/mis-citas-estudiante');
  },

  listarAsesor() {
    return apiRequest('/reuniones/mis-citas-asesor');
  },

  listarValidacionesEstudiante(status: string | null = null) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const query = params.toString();
    return apiRequest(
      `/reuniones/validaciones/estudiante${query ? `?${query}` : ''}`,
    );
  },

  listarValidacionesAsesor(status: string | null = null) {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const query = params.toString();
    return apiRequest(
      `/reuniones/validaciones/asesor${query ? `?${query}` : ''}`,
    );
  },

  detalle(id: string) {
    return apiRequest(`/reuniones/${id}`);
  },

  crear(payload: unknown) {
    return apiRequest('/reuniones', {
      method: 'POST',
      body: payload,
    });
  },

  crearAsesoria(payload: unknown) {
    return apiRequest('/reuniones/asesoria', {
      method: 'POST',
      body: payload,
    });
  },

  crearPresustentacion(payload: unknown) {
    return apiRequest('/reuniones/presustentacion', {
      method: 'POST',
      body: payload,
    });
  },

  cancelar(id: string, motivo: string | null = null) {
    return apiRequest(`/reuniones/${id}/cancelar`, {
      method: 'POST',
      body: { motivo },
    });
  },

  actualizarEstado(id: string, payload: unknown) {
    return apiRequest(`/reuniones/${id}/estado`, {
      method: 'PATCH',
      body: payload,
    });
  },

  responderReserva(validationCitaId: string, accion: string) {
    return apiRequest(`/reuniones/validaciones/${validationCitaId}/responder`, {
      method: 'POST',
      body: { accion },
    });
  },

  aprobarPagoReserva(validationCitaId: string, payload: unknown) {
    return apiRequest(
      `/reuniones/validaciones/${validationCitaId}/aprobar-pago`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  guardarGoogleMeet(id: string, payload: unknown) {
    return apiRequest(`/reuniones/${id}/google-meet`, {
      method: 'POST',
      body: payload,
    });
  },

  crearGoogleMeet(id: string) {
    return apiRequest(`/reuniones/${id}/google-meet/crear`, {
      method: 'POST',
    });
  },
};
