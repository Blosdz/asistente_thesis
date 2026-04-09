import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

import { cn } from '../../lib/cn';
import { useStoryScroll } from './SmoothScrollProvider';

type StoryPopupProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  size?: 'md' | 'lg' | 'xl';
  children: ReactNode;
};

const sizeMap = {
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
};

export default function StoryPopup({
  open,
  onClose,
  title,
  subtitle,
  size = 'lg',
  children,
}: StoryPopupProps) {
  const reducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { lockScroll, unlockScroll } = useStoryScroll();

  useEffect(() => {
    if (!open) {
      unlockScroll('story-popup');
      previousFocusRef.current?.focus?.({ preventScroll: true });
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    lockScroll('story-popup');
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockScroll('story-popup');
    };
  }, [lockScroll, onClose, open, unlockScroll]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[140]">
          <motion.div
            className="absolute inset-0 bg-slate-950/32 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.16 : 0.28 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-full items-center justify-center">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="story-popup-title"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, y: reducedMotion ? 0 : 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.98, y: reducedMotion ? 0 : 12 }}
                transition={{
                  duration: reducedMotion ? 0.18 : 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={cn(
                  'relative w-full overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,255,0.84))] shadow-[0_30px_100px_rgba(15,23,42,0.24)] backdrop-blur-2xl',
                  sizeMap[size],
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(59,130,246,0.14)_40%,transparent_70%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_42%)]" />

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/72 text-slate-500 transition-colors duration-200 hover:bg-white hover:text-slate-900"
                  aria-label="Cerrar demo"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative flex max-h-[88vh] flex-col overflow-hidden">
                  <div className="border-b border-white/70 px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
                    {subtitle ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                        {subtitle}
                      </p>
                    ) : null}
                    <h2
                      id="story-popup-title"
                      className="mt-3 max-w-2xl font-display text-3xl leading-tight text-slate-950 sm:text-4xl"
                    >
                      {title}
                    </h2>
                  </div>

                  <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">{children}</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
