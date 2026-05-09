import { suscripcionesApi } from '../api/suscripciones.api';

const unwrap = (data) => data?.data || data?.suscripcion || data;

export async function obtenerMiSuscripcion() {
  return unwrap(await suscripcionesApi.miSuscripcion());
}
