import { apiRequest } from './client';

export const authApi = {
  register(payload: { email: string; rol: string; contrasena: string }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },

  login(payload: { email: string; contrasena: string }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      auth: false,
      body: payload,
    });
  },

  cambiarPassword(payload: {
    contrasenaActual: string;
    contrasenaNueva: string;
  }) {
    return apiRequest('/auth/password', {
      method: 'PATCH',
      body: payload,
    });
  },
};
