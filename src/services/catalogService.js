import { supabase } from '../lib/supabase';
import { universities } from '../data/universities'; // Fallback data

/**
 * Obtiene la lista de universidades desde la tabla 'universidades' (schema public).
 * URL referencia: https://cdvsagdmfgjqvyfjrjwm.supabase.co/rest/v1/universidades
 */
export async function obtenerUniversidades() {
  try {
    const { data, error } = await supabase
      .schema('AT')
      .from('universidades')
      .select('id, nombre, ubicacion, pais')
      .order('nombre', { ascending: true });

    if (error) {
      console.warn(
        'Error fetching universities from DB, using fallback:',
        error,
      );
      return universities;
    }

    if (!data || data.length === 0) {
      console.warn('No universities found in DB, using fallback.');
      return universities;
    }

    return data;
  } catch (err) {
    console.error(
      'Unexpected error fetching universities, using fallback:',
      err,
    );
    return universities;
  }
}
