import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  xxl: 'text-2xl',
};

const widthMap = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[min(96vw,1320px)]',
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
 * - modalWidth?: 'md'|'lg'|'xl'|'full'
 * - primaryAction?: { label: string; onClick: () => void; disabled?: boolean }
 * - secondaryAction?: { label: string; onClick: () => void; disabled?: boolean }
 * - children?: ReactNode (custom content below description)
 */
const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  description,
  descriptionSize = 'md',
  modalWidth = 'md',
  primaryAction,
  secondaryAction,
  showDefaultHeader = true,
  showDefaultActions = true,
  panelClassName = '',
  contentClassName = '',
  closeButtonClassName = '',
  closeIconClassName = '',
  children,
}) => {
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);
  const onCloseRef = useRef(onClose);

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

  if (!open || typeof document === 'undefined') return null;

  const descClass = sizeMap[descriptionSize] || sizeMap.md;
  const modalWidthClass = widthMap[modalWidth] || widthMap.md;
  const defaultContentClass =
    'flex max-h-[min(88vh,960px)] flex-col gap-6 overflow-y-auto p-6 text-center sm:p-8 lg:p-10';
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
      <div className="ios-overlay absolute inset-0" />
      <div
        className={`glass-card-login relative z-10 w-full ${modalWidthClass} overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${panelClassName}`}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          className={`ios-secondary-button absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${closeButtonClassName}`}
          aria-label="Cerrar"
        >
          <X className={`h-5 w-5 text-slate-500 ${closeIconClassName}`} />
        </button>

        <div className={`${defaultContentClass} ${contentClassName}`.trim()}>
          {showDefaultHeader && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
              {subtitle && (
                <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
              )}
            </div>
          )}

          {description && (
            <p className={`${descClass} text-slate-700 leading-relaxed max-w-xl`}>{description}</p>
          )}

          {children && <div className="w-full text-left">{children}</div>}

          {showDefaultActions && (primaryAction || secondaryAction) && (
            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className="ios-secondary-button h-12 flex-1 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {secondaryAction.label}
                </button>
              )}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="ios-accent-button h-12 flex-1 rounded-2xl font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
