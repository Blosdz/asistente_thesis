import { supabase } from "@/lib/supabase";

type RegistroResultado = {
  user: unknown;
  session: unknown;
  queued: boolean;
};

async function encolarInvitacionSignup(params: {
  email: string;
  name: string;
  rol: "estudiante" | "asesor";
}) {
  const { data, error } = await supabase.functions.invoke(
    "encolar-invitacion-signup",
    {
      body: {
        email: params.email,
        name: params.name,
        rol: params.rol,
      },
    },
  );

  if (error) throw error;
  return data;
}

export async function registrarEstudiante(
  email: string,
  password: string,
  name: string,
) : Promise<RegistroResultado> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol: "estudiante",
          nombre: name,
          name,
        },
      },
    });

    if (error) throw error;
    return { ...data, queued: false };
  } catch (error: any) {
    if (error?.code === "over_email_send_rate_limit") {
      await encolarInvitacionSignup({
        email,
        name,
        rol: "estudiante",
      });

      return { user: null, session: null, queued: true };
    }

    throw error;
  }
}

export async function registrarAsesor(
  email: string,
  password: string,
  name: string,
) : Promise<RegistroResultado> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rol: "asesor",
          nombre: name,
          name,
        },
      },
    });

    if (error) throw error;
    return { ...data, queued: false };
  } catch (error: any) {
    if (error?.code === "over_email_send_rate_limit") {
      await encolarInvitacionSignup({
        email,
        name,
        rol: "asesor",
      });

      return { user: null, session: null, queued: true };
    }

    throw error;
  }
}

export async function loginEstudiante(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function loginUsuario(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const role = data?.user?.user_metadata?.rol || "estudiante";
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
