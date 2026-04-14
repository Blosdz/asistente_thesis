import { supabase } from '../lib/supabase';

const atSchema = () => supabase.schema('AT');

export async function obtenerMiSuscripcion() {
  const { data, error } = await atSchema().rpc('obtener_mi_suscripcion');

  if (error) {
    console.error('Error obteniendo mi suscripción:', error);
    throw error;
  }

  return Array.isArray(data) ? (data[0] ?? null) : data;
}
