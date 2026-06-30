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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const descClass = sizeMap[descriptionSize] || sizeMap.md;
  const modalWidthClass = widthMap[modalWidth] || widthMap.md;
  const hasDefaultActions =
    showDefaultActions && (primaryAction || secondaryAction);

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex h-dvh w-full items-center justify-center overflow-hidden p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose?.();
        }
      }}
    >
      <div className="ios-overlay absolute inset-0" />

      <div
        className={[
          'glass-card-login relative z-10 flex w-full flex-col overflow-hidden !p-0',
          'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]',
          'animate-in fade-in zoom-in-95 duration-300',
          modalWidthClass,
          panelClassName,
        ].join(' ')}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className={[
            'ios-secondary-button absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
            closeButtonClassName,
          ].join(' ')}
          aria-label="Cerrar"
        >
          <X
            className={['h-5 w-5 text-slate-500', closeIconClassName].join(' ')}
          />
        </button>

        {showDefaultHeader && (
          <header className="shrink-0 space-y-2 px-6 pt-6 text-center sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm font-semibold text-slate-500">
                {subtitle}
              </p>
            )}
          </header>
        )}

        <main
          data-modal-scroll="true"
          className={[
            'ios-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain text-left [overflow-anchor:none]',
            showDefaultHeader ? 'px-6 py-6 sm:px-8 sm:py-8 lg:px-10' : '',
            !showDefaultHeader && !contentClassName.includes('p-0')
              ? 'px-6 py-6 pt-10 sm:px-8 sm:py-8 lg:px-10'
              : '',
            contentClassName,
          ].join(' ')}
        >
          {description && (
            <p className={`${descClass} max-w-xl leading-relaxed text-slate-700`}>
              {description}
            </p>
          )}

          {children}
        </main>

        {hasDefaultActions && (
          <footer className="shrink-0 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur sm:px-8 lg:px-10">
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              {secondaryAction && (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className="ios-secondary-button h-12 flex-1 rounded-2xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {secondaryAction.label}
                </button>
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="ios-accent-button h-12 flex-1 rounded-2xl font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
