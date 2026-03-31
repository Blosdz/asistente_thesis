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
