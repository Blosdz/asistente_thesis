import { useEffect, useMemo, useState } from 'react';
import { Building2, QrCode } from 'lucide-react';

import { getPaymentMethodDetail } from './paymentMethodConfig';

const infoBoxClassName =
  'rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.28)]';

export default function PaymentMethodDetails({
  methodId,
  operationValue,
  onOperationChange,
  uploadSlot,
}) {
  const [copiedKey, setCopiedKey] = useState('');

  const detail = useMemo(() => getPaymentMethodDetail(methodId), [methodId]);

  useEffect(() => {
    if (!copiedKey) return undefined;

    const timeoutId = window.setTimeout(() => {
      setCopiedKey('');
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [copiedKey]);

  const handleCopy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
    } catch {
      setCopiedKey('');
    }
  };

  return (
    <div className="space-y-4">
      {detail.kind === 'bank' ? (
        <div className="grid gap-3">
          {detail.bankAccounts.map((account) => (
            <div
              key={account.id}
              className={`rounded-[22px] border px-4 py-4 ${account.themeClassName}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-white/80 text-slate-700">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {account.bank}
                  </p>
                  <p className="text-[11px] text-slate-500">{account.accountType}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className={infoBoxClassName}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Cuenta
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {account.accountNumber}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(account.accountNumberRaw, `${account.id}-account`)
                      }
                      className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-semibold text-white transition ${account.copyClassName}`}
                    >
                      {copiedKey === `${account.id}-account` ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className={infoBoxClassName}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    CCI
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{account.cci}</p>
                    <button
                      type="button"
                      onClick={() => handleCopy(account.cciRaw, `${account.id}-cci`)}
                      className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-semibold text-white transition ${account.copyClassName}`}
                    >
                      {copiedKey === `${account.id}-cci` ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-[18px] bg-white/70 px-4 py-3">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  Titular
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {account.holder}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-5 py-6 text-center">
            <div className="mx-auto flex h-[164px] w-[164px] items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50">
              <div className="space-y-3 text-slate-400">
                <QrCode className="mx-auto h-12 w-12" />
                <p className="text-xs font-medium">{detail.qrLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className={infoBoxClassName}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Titular
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {detail.accountName}
              </p>
            </div>
            <div className={infoBoxClassName}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                {detail.phoneLabel}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {detail.phone}
              </p>
            </div>
            <div className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm leading-6 text-slate-600">{detail.note}</p>
            </div>
          </div>
        </div>
      )}

      {typeof onOperationChange === 'function' && (
        <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_-22px_rgba(15,23,42,0.28)]">
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {detail.operationLabel}
          </label>
          <input
            type="text"
            value={operationValue}
            onChange={(event) => onOperationChange(event.target.value)}
            placeholder={detail.operationPlaceholder}
            className="mt-3 w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
          <p className="mt-2 text-xs text-slate-500">{detail.operationHint}</p>
        </div>
      )}

      {uploadSlot}
    </div>
  );
}
