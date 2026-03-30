import { supabase } from '../lib/supabase';

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  caracteristicas: any;
  activo: boolean;
};

export async function getPlanes(): Promise<Plan[]> {
  const { data, error } = await supabase
    .schema('AT')
    .rpc('fn_get_planes');
  if (error) throw new Error(error.message);
  return (data ?? []) as Plan[];
}

export async function comprarPlan(params: {
  estudianteId: string;
  planId: string;
  duracionDias?: number;
}) {
  const { estudianteId, planId, duracionDias = 30 } = params;
  const ahora = new Date();
  const expira = new Date(ahora);
  expira.setDate(expira.getDate() + duracionDias);
  const expiraEn = expira.toISOString();
  const supabaseAT = supabase.schema('AT');
  const { data, error } = await supabaseAT
    .from('suscripciones_estudiante')
    .insert({
      estudiante_id: estudianteId,
      plan_id: planId,
      estado: 'pendiente',
      iniciado_en: ahora.toISOString(),
      expira_en: expiraEn,
    })
    .select()
    .single();
  console.log({ data, error });
  if (error) throw new Error(error.message);
  return data;
}
