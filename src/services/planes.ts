import { pagosApi } from '../api/pagos.api';

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  caracteristicas: unknown;
  activo: boolean;
};

export async function getPlanes(): Promise<Plan[]> {
  const data = await pagosApi.obtenerPlanes();
  if (Array.isArray(data)) return data as Plan[];
  if (Array.isArray((data as any)?.data)) return (data as any).data;
  return [];
}

export async function comprarPlan({
  planId,
  tesisId = null,
  codigoOperacion = null,
}: {
  planId: string;
  tesisId?: string | null;
  codigoOperacion?: string | null;
}) {
  const data = await pagosApi.iniciarPagoPlan({
    planId,
    tesisId,
    codigoOperacion,
  });
  return (data as any)?.data || data;
}
