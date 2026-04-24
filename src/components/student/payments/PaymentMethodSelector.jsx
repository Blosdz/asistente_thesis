import { Check } from 'lucide-react';

import { paymentMethods } from './paymentMethodConfig';

export default function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  className = '',
}) {
  return (
    <div className={`grid grid-cols-3 gap-3 ${className}`.trim()}>
      {paymentMethods.map((method) => {
        const active = selectedMethod === method.id;
        const Icon = method.icon;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`relative flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-[20px] border px-3 py-4 text-center transition-all ${
              active
                ? method.activeClassName
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {active && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/80 bg-white/80 text-sky-700 shadow-[0_8px_18px_rgba(125,168,214,0.18)]">
                <Check className="h-3 w-3" />
              </span>
            )}

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${method.iconClassName}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-slate-900">{method.label}</p>
              <p className="text-[11px] text-slate-500">{method.helper}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
