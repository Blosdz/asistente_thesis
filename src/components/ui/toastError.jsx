import { AlertTriangle, X } from 'lucide-react';

const ToastError = ({ title = 'Ocurrió un error', message, onClose }) => {
  return (
    <div className="flex items-start gap-3 p-4 min-w-[280px] max-w-sm rounded-2xl bg-white/80 backdrop-blur-xl border border-red-200/60 shadow-[0_12px_30px_rgba(239,68,68,0.15)]">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-inner">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        {message && <p className="text-sm text-slate-600 leading-relaxed mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default ToastError;
