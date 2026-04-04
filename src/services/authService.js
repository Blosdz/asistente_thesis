import { supabase } from '../lib/supabase';

async function encolarInvitacionSignup({ email, name, rol }) {
  const { data, error } = await supabase.functions.invoke(
    'encolar-invitacion-signup',
    {
      body: {
        email,
        name,
        rol,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data;
}

function construirRedirectResetPassword(redirectTo) {
  if (redirectTo) {
    return redirectTo;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/#/reset-password`;
}

export async function registrarEstudiante(email, password, name) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol: 'estudiante',
          nombre: name,
          name,
        },
      },
    });

    if (error) throw error;
    return { ...data, queued: false };
  } catch (error) {
    if (error?.code === 'over_email_send_rate_limit') {
      await encolarInvitacionSignup({
        email,
        name,
        rol: 'estudiante',
      });

      return { user: null, session: null, queued: true };
    }

    throw error;
  }
}

export async function registrarAsesor(email, password, name) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol: 'asesor',
          nombre: name,
          name,
        },
      },
    });

    if (error) throw error;
    return { ...data, queued: false };
  } catch (error) {
    if (error?.code === 'over_email_send_rate_limit') {
      await encolarInvitacionSignup({
        email,
        name,
        rol: 'asesor',
      });

      return { user: null, session: null, queued: true };
    }

    throw error;
  }
}

export async function loginEstudiante(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function loginUsuario(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const role = data?.user?.user_metadata?.rol || 'estudiante';
  return { ...data, role };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function isAuthenticated() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return false;
  return !!session;
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export async function enviarResetPassword(email, options = {}) {
  const redirectTo = construirRedirectResetPassword(options.redirectTo);
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function cambiarPassword(password) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function escucharCambiosAuth(callback) {
  return supabase.auth.onAuthStateChange(callback);
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
    hashParams.has('access_token')
  );
}
