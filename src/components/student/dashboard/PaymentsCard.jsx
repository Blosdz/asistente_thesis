import { CreditCard } from 'lucide-react';

import { Card } from '../../ui/card';

const formatCurrency = (amount, currency) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency || 'PEN',
    minimumFractionDigits: 2,
  }).format(amount || 0);

export default function PaymentsCard({ payments, onOpenPayments, formatterFechaCorta, hasValidDate }) {
  return (
    <Card className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Pagos
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">
            Pagos pendientes
          </h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-amber-600">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {payments.length > 0 ? (
          payments.slice(0, 3).map((pago) => (
            <div
              key={pago.id || pago.concepto}
              className="rounded-2xl border border-white/70 bg-white/70 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {pago.concepto}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Estado: {pago.estado}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Monto: {formatCurrency(pago.monto, pago.moneda)}
              </p>
              {pago.fecha && hasValidDate(pago.fecha) && (
                <p className="mt-1 text-xs text-slate-400">
                  Registrado: {formatterFechaCorta.format(new Date(pago.fecha))}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">
            No tienes pagos pendientes en este momento.
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenPayments}
        className="ios-secondary-button mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
      >
        Ver pagos
      </button>
    </Card>
  );
}
