import { authApi } from '../api/auth.api';
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  pendingEndpoint,
  setStoredSession,
} from '../api/client';
import { usuariosApi } from '../api/usuarios.api';

function getUsuarioFromResponse(data) {
  return data?.usuario || data?.user || data?.data?.usuario || data?.data?.user || null;
}

function getTokenFromResponse(data) {
  return (
    data?.token ||
    data?.access_token ||
    data?.accessToken ||
    data?.data?.token ||
    data?.data?.access_token ||
    null
  );
}

function normalizeUser(usuario) {
  if (!usuario) return null;
  return {
    ...usuario,
    id: usuario.id || usuario.usuario_id || usuario.auth_usuario_id,
    email: usuario.email || usuario.correo || usuario.email_publico,
    user_metadata: {
      ...(usuario.user_metadata || {}),
      rol: usuario.rol,
      nombre: usuario.nombre || usuario.nombres,
    },
  };
}

function buildSession(token, usuario) {
  if (!token) return null;
  return {
    access_token: token,
    token_type: 'bearer',
    user: normalizeUser(usuario),
  };
}

async function registerByRole(email, password, rol) {
  const data = await authApi.register({
    email,
    rol,
    contrasena: password,
  });

  return {
    user: normalizeUser(getUsuarioFromResponse(data)),
    session: null,
    queued: false,
    data,
  };
}

export async function registrarEstudiante(email, password) {
  return registerByRole(email, password, 'estudiante');
}

export async function registrarAsesor(email, password) {
  return registerByRole(email, password, 'asesor');
}

export async function verificarEmail(token) {
  return authApi.verificarEmail(token);
}

export async function loginEstudiante(email, password) {
  return loginUsuario(email, password);
}

export async function loginUsuario(email, password) {
  const data = await authApi.login({
    email,
    contrasena: password,
  });
  const token = getTokenFromResponse(data);
  const usuario = normalizeUser(getUsuarioFromResponse(data));

  if (!token || !usuario) {
    throw new Error('El backend no devolvió token y usuario para iniciar sesión.');
  }

  setStoredSession(token, usuario);

  return {
    user: usuario,
    usuario,
    session: buildSession(token, usuario),
    token,
    role: usuario.rol || usuario.user_metadata?.rol || 'estudiante',
    data,
  };
}

export async function logout() {
  clearStoredSession();
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const data = await usuariosApi.me();
    const usuario = normalizeUser(getUsuarioFromResponse(data) || data);
    if (usuario) {
      setStoredSession(token, usuario);
    }
    return usuario;
  } catch (error) {
    if (error?.status === 401) return null;
    const storedUser = normalizeUser(getStoredUser());
    if (storedUser) return storedUser;
    throw error;
  }
}

export async function isAuthenticated() {
  if (!getStoredToken()) return false;
  return Boolean(await getCurrentUser());
}

export async function getCurrentSession() {
  const token = getStoredToken();
  if (!token) return null;
  return buildSession(token, normalizeUser(getStoredUser()));
}

export async function enviarResetPassword(email) {
  return authApi.solicitarResetPassword({ email });
}

export async function cambiarPassword(password, options = {}) {
  if (!options.contrasenaActual) {
    const token =
      options.token ||
      (typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('token') ||
          new URLSearchParams(window.location.hash.replace(/^#/, '')).get('token')
        : null);

    if (!token) {
      pendingEndpoint(
        'Cambio de contraseña sin contraseña actual / flujo de recuperación',
      );
    }

    return authApi.resetPassword({
      token,
      contrasenaNueva: password,
    });
  }

  return authApi.cambiarPassword({
    contrasenaActual: options.contrasenaActual,
    contrasenaNueva: password,
  });
}

export function escucharCambiosAuth() {
  return {
    data: {
      subscription: {
        unsubscribe() {},
      },
    },
  };
}

export function esFlujoRecuperacionPassword() {
  if (typeof window === 'undefined') {
    return false;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return (
    searchParams.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery' ||
    searchParams.has('code') ||
    searchParams.has('token_hash') ||
    searchParams.has('token') ||
    hashParams.has('token') ||
    hashParams.has('access_token')
  );
}
