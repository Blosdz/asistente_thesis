import { universities } from '../data/universities';

export async function obtenerUniversidades() {
  console.warn(
    'Catálogo de universidades pendiente: no hay endpoint NestJS documentado. Usando fallback local.',
  );
  return universities;
}
