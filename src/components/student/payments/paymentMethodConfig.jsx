import { Landmark, Smartphone, Wallet } from 'lucide-react';

export const paymentMethods = [
  {
    id: 'yape',
    label: 'Yape',
    helper: 'QR o número',
    icon: Smartphone,
    iconClassName: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white',
    activeClassName:
      'border-violet-300 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-[0_12px_30px_-22px_rgba(124,58,237,0.45)]',
  },
  {
    id: 'plin',
    label: 'Plin',
    helper: 'QR o número',
    icon: Wallet,
    iconClassName: 'bg-gradient-to-br from-cyan-500 to-sky-500 text-white',
    activeClassName:
      'border-cyan-300 bg-gradient-to-br from-cyan-50 to-sky-50 shadow-[0_12px_30px_-22px_rgba(14,165,233,0.35)]',
  },
  {
    id: 'transferencia',
    label: 'Transferencia',
    helper: 'Cuenta y CCI',
    icon: Landmark,
    iconClassName: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white',
    activeClassName:
      'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_12px_30px_-22px_rgba(16,185,129,0.35)]',
  },
];

export const paymentMethodDetails = {
  yape: {
    kind: 'mobile',
    title: 'Pago por Yape',
    note: 'Escanea el QR o transfiere al número exacto.',
    qrLabel: 'QR de Yape',
    accountName: 'Thesis Assistant SAC',
    phoneLabel: 'Número Yape',
    phone: '999 888 777',
    operationLabel: 'Número de operación',
    operationHint: 'Usa el código que ves en tu comprobante de Yape.',
    operationPlaceholder: 'Ej: 123456789',
  },
  plin: {
    kind: 'mobile',
    title: 'Pago por Plin',
    note: 'Usa tu app bancaria o Plin para enviar el monto exacto.',
    qrLabel: 'QR de Plin',
    accountName: 'Thesis Assistant SAC',
    phoneLabel: 'Número Plin',
    phone: '999 888 777',
    operationLabel: 'Número de operación',
    operationHint: 'Usa el código que aparece en tu comprobante de Plin.',
    operationPlaceholder: 'Ej: 123456789',
  },
  transferencia: {
    kind: 'bank',
    title: 'Transferencia o depósito',
    note: 'Puedes pagar con la cuenta o CCI que prefieras.',
    operationLabel: 'Número de operación o depósito',
    operationHint: 'Ingresa el número visible en tu voucher bancario.',
    operationPlaceholder: 'Ej: 00234567890',
    bankAccounts: [
      {
        id: 'bcp',
        bank: 'BCP',
        accountType: 'Ahorros',
        accountNumber: '194-2984756-0-11',
        accountNumberRaw: '1942984756011',
        cci: '002-194-002984756011-11',
        cciRaw: '00219400298475601111',
        holder: 'Thesis Assistant SAC',
        themeClassName: 'border-emerald-200 bg-emerald-50/80',
        copyClassName: 'bg-emerald-600 hover:bg-emerald-700',
      },
      {
        id: 'interbank',
        bank: 'Interbank',
        accountType: 'Ahorros',
        accountNumber: '200-3048576-2-22',
        accountNumberRaw: '2003048576222',
        cci: '003-200-003048576222-22',
        cciRaw: '00320000304857622222',
        holder: 'Thesis Assistant SAC',
        themeClassName: 'border-sky-200 bg-sky-50/80',
        copyClassName: 'bg-sky-600 hover:bg-sky-700',
      },
    ],
  },
};

export const getPaymentMethodDetail = (methodId) =>
  paymentMethodDetails[methodId] || paymentMethodDetails.yape;

export const normalizePaymentMethod = (methodId) =>
  paymentMethods.some((method) => method.id === methodId) ? methodId : 'yape';
