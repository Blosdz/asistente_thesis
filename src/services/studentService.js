import { usuariosApi } from '../api/usuarios.api';

function unwrapUsuario(data) {
  return data?.usuario || data?.user || data?.data?.usuario || data;
}

function pickPerfil(usuario) {
  return (
    usuario?.perfil_estudiante ||
    usuario?.estudiante ||
    usuario?.perfil?.estudiante ||
    usuario?.perfil ||
    usuario ||
    null
  );
}

function mapearPerfil(raw) {
  if (!raw) return null;

  return {
    tiene_informacion:
      raw.tiene_informacion ??
      raw.r_tiene_informacion ??
      Boolean(raw.estudiante_id || raw.id || raw.nombres || raw.apellidos),
    estudiante_id: raw.estudiante_id ?? raw.r_estudiante_id ?? raw.id ?? null,
    perfil_id: raw.perfil_id ?? raw.r_perfil_id ?? null,
    nombres: raw.nombres ?? raw.r_nombres ?? '',
    apellidos: raw.apellidos ?? raw.r_apellidos ?? '',
    universidad_id:
      raw.universidad_id ?? raw.universidadId ?? raw.r_universidad_id ?? '',
    carrera: raw.carrera ?? raw.r_carrera ?? '',
    dni: raw.dni ?? raw.r_dni ?? '',
    telefono: raw.telefono ?? raw.r_telefono ?? '',
    creado_en: raw.creado_en ?? raw.r_creado_en ?? null,
  };
}

export async function obtenerPerfilEstudiante() {
  const data = await usuariosApi.me();
  return mapearPerfil(pickPerfil(unwrapUsuario(data)));
}

export async function guardarPerfilEstudiante(perfil) {
  const data = await usuariosApi.guardarPerfilEstudiante({
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    universidadId: perfil.universidad_id || perfil.universidadId || null,
    carrera: perfil.carrera,
    dni: perfil.dni,
    telefono: perfil.telefono,
  });

  return mapearPerfil(pickPerfil(unwrapUsuario(data))) || data;
}
