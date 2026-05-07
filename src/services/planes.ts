import { pendingEndpoint } from '../api/client';

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  caracteristicas: unknown;
  activo: boolean;
};

export async function getPlanes(): Promise<Plan[]> {
  pendingEndpoint('Planes');
}

export async function comprarPlan() {
  pendingEndpoint('Compra de planes / suscripciones');
}
