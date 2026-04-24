import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function PlanesList() {
  const navigate = useNavigate();

  return (
    <Card className="glass max-w-3xl rounded-[28px] p-8">
      <CardHeader className="mb-6 space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Flujo unificado
        </p>
        <CardTitle className="text-2xl font-black tracking-tight text-slate-900">
          La cotización del plan ahora vive en Mi Tesis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm leading-7 text-slate-600">
        <p>
          Para evitar pagos duplicados, la selección del plan, el tipo de tesis
          y el cálculo final del precio se hacen juntos cuando creas tu tesis.
        </p>
        <p>
          Desde allí podrás revisar el desglose completo y pasar directo al pago
          pendiente con el voucher listo para subir.
        </p>
        <button
          type="button"
          onClick={() => navigate('/student/my-thesis')}
          className="inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Ir a Mi Tesis
        </button>
      </CardContent>
    </Card>
  );
}
