import { supabase } from '../lib/supabase';

// Helper para especificar el esquema AT
const atSchema = () => supabase.schema('AT');

/**
 * Mapea los campos con prefijo r_ del RPC a nombres sin prefijo para la UI
 */
function mapearPerfilRPC(raw) {
  if (!raw) return null;
  return {
    tiene_informacion: raw.r_tiene_informacion,
    estudiante_id: raw.r_estudiante_id,
    perfil_id: raw.r_perfil_id,
    nombres: raw.r_nombres,
    apellidos: raw.r_apellidos,
    universidad_id: raw.r_universidad_id,
    carrera: raw.r_carrera,
    dni: raw.r_dni,
    telefono: raw.r_telefono,
    creado_en: raw.r_creado_en,
  };
}

export async function obtenerPerfilEstudiante() {
  const { data, error } = await atSchema().rpc('obtener_perfil_estudiante');

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  // El RPC devuelve un array, obtener el primer elemento y mapearlo
  const raw = Array.isArray(data) ? data[0] : data;
  return mapearPerfilRPC(raw);
}

export async function guardarPerfilEstudiante(perfil) {
  const { data, error } = await atSchema().rpc('guardar_perfil_estudiante', {
    p_nombres: perfil.nombres,
    p_apellidos: perfil.apellidos,
    p_universidad_id: perfil.universidad_id,
    p_carrera: perfil.carrera,
    p_dni: perfil.dni,
    p_telefono: perfil.telefono,
  });

  if (error) {
    console.error('Error saving profile:', error);
    throw error;
  }

  return data;
}
