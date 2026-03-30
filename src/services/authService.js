import { supabase } from '../lib/supabase';

export async function registrarEstudiante(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        rol: 'estudiante',
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function registrarAsesor(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        rol: 'asesor',
      },
    },
  });

  if (error) throw error;
  return data;
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
