import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  xxl: 'text-2xl',
};

/**
 * Multi-purpose glassmorphism modal.
 * Props:
 * - open: boolean to show/hide
 * - onClose: () => void
 * - title: string
 * - subtitle?: string
 * - description?: string | JSX
 * - descriptionSize?: 'sm'|'md'|'lg'|'xl'|'xxl'
 * - primaryAction?: { label: string; onClick: () => void }
 * - secondaryAction?: { label: string; onClick: () => void }
 * - children?: ReactNode (custom content below description)
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  description,
  descriptionSize = 'md',
  primaryAction,
  secondaryAction,
  children,
}) => {
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    // Focus the close button when modal opens
    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !mounted) return null;

  const descClass = sizeMap[descriptionSize] || sizeMap.md;
  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex h-full w-full items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose?.();
        }
      }}
    >
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[8px]" />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-300">
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>

        <div className="p-10 sm:p-12 flex flex-col items-center text-center gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm font-semibold text-slate-500">{subtitle}</p>}
          </div>

          {description && (
            <p className={`${descClass} text-slate-700 leading-relaxed max-w-xl`}>{description}</p>
          )}

          {children && <div className="w-full">{children}</div>}

          <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white/70 text-slate-700 font-semibold hover:bg-white transition-colors"
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex-1 h-12 rounded-2xl bg-primary text-white font-semibold shadow-[0_10px_25px_-5px_rgba(10,71,238,0.35)] hover:brightness-105 active:scale-[0.99] transition"
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
