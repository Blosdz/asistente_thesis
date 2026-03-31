import { useEffect, useState } from 'react';
import { getPlanes, type Plan } from '../services/planes';
import { iniciarPagoPlan } from '../services/pagosService';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export default function PlanesList() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [comprandoId, setComprandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPlanes();
        setPlanes(data);
      } catch (err: any) {
        setError(err.message || 'No se pudieron cargar los planes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleComprar = async (plan: Plan) => {
    try {
      setComprandoId(plan.id);
      setError(null);
      setOk(null);
      await iniciarPagoPlan({
        planId: plan.id,
      });
      setOk(`Se genero la nota de pago del plan "${plan.nombre}".`);
    } catch (err: any) {
      setError(err.message || 'No se pudo comprar el plan');
    } finally {
      setComprandoId(null);
    }
  };

  if (loading) return <p>Cargando planes...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid gap-4">
      {ok && <div className="rounded border p-3">{ok}</div>}
      {planes.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <CardTitle>{plan.nombre}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-lg mb-1">S/ {Number(plan.precio).toFixed(2)}</p>
            <p className="mb-2">{plan.duracion_dias} dias</p>
            {Array.isArray(plan.caracteristicas) && (
              <ul className="mt-2 list-disc pl-5">
                {plan.caracteristicas.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
            <button
              className="mt-4 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={() => handleComprar(plan)}
              disabled={comprandoId === plan.id}
            >
              {comprandoId === plan.id ? 'Procesando...' : 'Comprar plan'}
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
