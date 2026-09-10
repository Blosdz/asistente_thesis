import { useState } from 'react';
import { UserPlus, ArrowRight, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Card } from '../../ui/card';
import { vincularmeConAsesorPorCodigo } from '../../../services/advisorService';

export default function AdvisorConnectionCard({
  advisor,
  onOpenAdvisors,
  onConnected,
}) {
  const [codigo, setCodigo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const estado = (advisor?.estado || '').toLowerCase();
  const pendiente = estado === 'pendiente';
  const conectado = Boolean(advisor?.id) && !pendiente;

  const handleConnect = async () => {
    const valor = codigo.trim();
    if (!valor) {
      toast.error('Ingresa el código público de tu asesor.');
      return;
    }

    try {
      setSubmitting(true);
      await vincularmeConAsesorPorCodigo(valor);
      toast.success(
        'Solicitud enviada. Tu asesor debe aceptarla para completar la vinculación.',
      );
      setCodigo('');
      await onConnected?.();
    } catch (error) {
      console.error('Error vinculando asesor por código:', error);
      toast.error(error?.message || 'No se pudo vincular con ese código.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-[32px] border border-white/70 bg-gradient-to-br from-white via-white to-emerald-50/60 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Conexion con asesor
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            {conectado ? 'Tu asesor' : 'Vincula tu asesor'}
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-emerald-600">
          <UserPlus className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 p-4">
        {advisor?.id ? (
          <>
            <p className="text-sm font-semibold text-slate-900">
              {advisor.name || 'Asesor'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {advisor.career || 'Asesor de tesis'}
            </p>
            <p
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                pendiente
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {pendiente ? (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  Pendiente de aprobación
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Asesor conectado
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">
              Aun no tienes asesor conectado
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Ingresa un codigo para vincularte.
            </p>
          </>
        )}
      </div>

      {!conectado && (
        <>
          <div className="mt-4">
            <label
              htmlFor="advisor-code"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
            >
              Codigo del asesor
            </label>
            <input
              id="advisor-code"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleConnect();
              }}
              placeholder="Ej: CBF4A5AF2F"
              autoComplete="off"
              disabled={submitting}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm uppercase tracking-[0.15em] text-slate-700 focus:border-blue-300 focus:outline-none disabled:opacity-60"
            />
          </div>

          <button
            type="button"
            onClick={handleConnect}
            disabled={submitting}
            className="ios-accent-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                {pendiente ? 'Reenviar solicitud' : 'Conectar asesor'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onOpenAdvisors}
        className="mt-3 w-full text-center text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
      >
        Ver mis asesores
      </button>
    </Card>
  );
}
