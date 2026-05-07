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
const getPlanName = (subscription) =>
  subscription?.plan_nombre ||
  subscription?.nombre_plan ||
  subscription?.plan ||
  subscription?.nombre ||
  null;

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
  compact = false,
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
      className={`border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 shadow-[0_14px_40px_rgba(15,23,42,0.05)] ${
        compact ? 'rounded-3xl p-4' : 'rounded-[28px] p-6'
      } ${className}`}
    >
      <div
        className={`flex items-start justify-between ${
          compact ? 'gap-3' : 'gap-4'
        }`}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Plan actual
          </p>
          <h3
            className={`font-bold text-slate-900 ${
              compact ? 'mt-1 text-base' : 'mt-2 text-lg'
            }`}
          >
            {getPlanName(subscription) ||
              (compact ? 'Cobertura disponible' : 'Beneficios disponibles')}
          </h3>
          {subscription && getPlanName(subscription) && !compact && (
            <p className="mt-1 text-sm text-slate-500">
              Revisa tus asesorías, pre-sustentaciones y fecha de expiración.
            </p>
          )}
        </div>
        <div
          className={`flex items-center justify-center rounded-2xl bg-blue-100 text-blue-700 ${
            compact ? 'h-10 w-10' : 'h-11 w-11'
          }`}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </div>
      </div>

      {loading ? (
        <p className={`text-slate-500 ${compact ? 'mt-3 text-xs' : 'mt-4 text-sm'}`}>
          Cargando tu suscripción activa...
        </p>
      ) : subscription ? (
        <>
          {coverageMeta && (
            <div
              className={`rounded-2xl border font-semibold ${
                compact ? 'mt-3 px-3 py-2 text-xs' : 'mt-4 px-4 py-3 text-sm'
              } ${
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

          <div
            className={`grid gap-3 sm:grid-cols-2 ${
              compact ? 'mt-4' : 'mt-5'
            }`}
          >
            <div
              className={`rounded-2xl border border-slate-200 bg-white/80 ${
                compact ? 'p-3' : 'p-4'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Asesorías
              </p>
              <p
                className={`font-black text-slate-900 ${
                  compact ? 'mt-1.5 text-xl' : 'mt-2 text-2xl'
                }`}
              >
                {asesoriasDisponibles}
              </p>
              <p className={`text-xs text-slate-500 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                {asesoriasUsadas} usadas de {asesoriasIncluidas}
              </p>
            </div>

            <div
              className={`rounded-2xl border border-slate-200 bg-white/80 ${
                compact ? 'p-3' : 'p-4'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Pre-sustentaciones
              </p>
              <p
                className={`font-black text-slate-900 ${
                  compact ? 'mt-1.5 text-xl' : 'mt-2 text-2xl'
                }`}
              >
                {presustentacionesDisponibles}
              </p>
              <p className={`text-xs text-slate-500 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                {presustentacionesUsadas} usadas de {presustentacionesIncluidas}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 text-slate-600 ${
              compact ? 'mt-3 px-3 py-2 text-xs' : 'mt-4 px-4 py-3 text-sm'
            }`}
          >
            <CalendarClock className="h-4 w-4 text-blue-600" />
            Vence el {formatDate(subscription.expira_en)}
          </div>
        </>
      ) : (
        <div
          className={`rounded-2xl border border-dashed border-slate-200 bg-white/70 text-slate-600 ${
            compact ? 'mt-3 px-3 py-3 text-xs' : 'mt-4 px-4 py-4 text-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
            {compact ? 'Sin plan activo' : 'No tienes un plan activo'}
          </div>
          <p className={compact ? 'mt-1.5 leading-5' : 'mt-2 leading-6'}>
            {compact
              ? 'Tus solicitudes seguirán el flujo normal de pago.'
              : 'Las solicitudes que no estén cubiertas por un plan seguirán el flujo normal de pago cuando el asesor las acepte.'}
          </p>
        </div>
      )}
    </div>
  );
}
