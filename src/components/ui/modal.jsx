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
  const noContentPadding = contentClassName.includes('p-0');

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
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-[2px]" />

      <div
        className={[
          'relative z-10 flex w-full flex-col overflow-hidden rounded-[28px] bg-white',
          'shadow-[0_28px_90px_-16px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/5',
          'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]',
          'animate-in fade-in zoom-in-95 duration-200',
          modalWidthClass,
          panelClassName,
        ].join(' ')}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className={[
            'absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full',
            'bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
            closeButtonClassName,
          ].join(' ')}
          aria-label="Cerrar"
        >
          <X className={['h-4 w-4', closeIconClassName].join(' ')} />
        </button>

        {showDefaultHeader && (
          <header className="shrink-0 px-6 pb-1 pr-14 pt-6 text-left sm:px-8 sm:pt-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[1.5rem]">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </header>
        )}

        <main
          data-modal-scroll="true"
          className={[
            'ios-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain text-left [overflow-anchor:none]',
            showDefaultHeader && !noContentPadding ? 'px-6 py-5 sm:px-8' : '',
            !showDefaultHeader && !noContentPadding ? 'px-6 pb-6 pt-14 sm:px-8' : '',
            contentClassName,
          ].join(' ')}
        >
          {description && (
            <p className={`${descClass} max-w-xl leading-relaxed text-slate-600`}>
              {description}
            </p>
          )}

          {children}
        </main>

        {hasDefaultActions && (
          <footer className="shrink-0 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {secondaryAction ? (
                <button
                  type="button"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {secondaryAction.label}
                </button>
              ) : (
                <span />
              )}

              {primaryAction && (
                <button
                  type="button"
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
