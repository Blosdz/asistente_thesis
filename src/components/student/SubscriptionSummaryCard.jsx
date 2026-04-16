import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Sin fecha de vencimiento';

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const toNumber = (value) => Number(value || 0);

const getCoverageMeta = (subscription, serviceType) => {
  if (!subscription || !serviceType) {
    return null;
  }

  if (serviceType === 'presustentacion') {
    return {
      available: toNumber(subscription.presustentaciones_disponibles),
      label: 'pre-sustentaciones',
      included: toNumber(subscription.presustentaciones_incluidas),
    };
  }

  return {
    available: toNumber(subscription.asesorias_disponibles),
    label: 'asesorías',
    included: toNumber(subscription.asesorias_incluidas),
  };
};

export default function SubscriptionSummaryCard({
  subscription,
  loading = false,
  serviceType = null,
  className = '',
}) {
  const asesoriasDisponibles = toNumber(subscription?.asesorias_disponibles);
  const asesoriasIncluidas = toNumber(subscription?.asesorias_incluidas);
  const asesoriasUsadas = toNumber(subscription?.asesorias_usadas);
  const presustentacionesDisponibles = toNumber(
    subscription?.presustentaciones_disponibles,
  );
  const presustentacionesIncluidas = toNumber(
    subscription?.presustentaciones_incluidas,
  );
  const presustentacionesUsadas = toNumber(
    subscription?.presustentaciones_usadas,
  );
  const coverageMeta = getCoverageMeta(subscription, serviceType);

  return (
    <div
      className={`rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Plan Activo
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Beneficios disponibles
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">
          Cargando tu suscripción activa...
        </p>
      ) : subscription ? (
        <>
          {coverageMeta && (
            <div
              className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                coverageMeta.available > 0
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {coverageMeta.available > 0
                ? `Tu plan puede cubrir esta ${serviceType === 'presustentacion' ? 'solicitud' : 'sesión'} sin pago adicional.`
                : `Tu plan ya no tiene ${coverageMeta.label} disponibles para esta solicitud.`}
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Asesorías
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {asesoriasDisponibles}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {asesoriasUsadas} usadas de {asesoriasIncluidas}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Pre-sustentaciones
              </p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {presustentacionesDisponibles}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {presustentacionesUsadas} usadas de {presustentacionesIncluidas}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600">
            <CalendarClock className="h-4 w-4 text-blue-600" />
            Vence el {formatDate(subscription.expira_en)}
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
            No tienes un plan activo
          </div>
          <p className="mt-2 leading-6">
            Las solicitudes que no estén cubiertas por un plan seguirán el flujo
            normal de pago cuando el asesor las acepte.
          </p>
        </div>
      )}
    </div>
  );
}
