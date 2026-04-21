import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';

import { cn } from '../../lib/cn';
import GlassCard from '../ui/GlassCard';
import {
  CARD_INSET_CLASS,
  MediaOverlay,
  PILL_CLASS,
} from '../ui/cardPrimitives';
import { testimonials } from './landingData';

const outcomeStats = [
  {
    value: 'Tema claro',
    label: 'Estudiantes que pasaron de ideas sueltas a un tema viable y defendible.',
  },
  {
    value: 'Borrador avanzado',
    label: 'Mejor estructura, redacción académica y observaciones priorizadas.',
  },
  {
    value: 'Sustentación segura',
    label: 'Preparación para exponer, responder preguntas y defender el proyecto.',
  },
];

export default function OutcomesSection() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [cardPitch, setCardPitch] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const firstCard = track?.children[0] as HTMLElement | undefined;

      if (!viewport || !track || !firstCard) return;

      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0');
      const nextPitch = firstCard.offsetWidth + gap;
      const nextMaxDrag = Math.max(track.scrollWidth - viewport.clientWidth, 0);

      setCardPitch(nextPitch);
      setMaxDrag(nextMaxDrag);
      setActiveIndex((current) =>
        Math.min(current, Math.max(testimonials.length - 1, 0)),
      );
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);

    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    if (trackRef.current) resizeObserver.observe(trackRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const activeOffset = useMemo(() => {
    if (!cardPitch) return 0;

    return Math.min(activeIndex * cardPitch, maxDrag);
  }, [activeIndex, cardPitch, maxDrag]);

  const selectIndex = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, testimonials.length - 1)));
  };

  const goPrev = () => selectIndex(activeIndex - 1);
  const goNext = () => selectIndex(activeIndex + 1);

  return (
    <section
      id="resultados"
      className="relative overflow-hidden bg-white py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_44%,#ffffff_100%)]" />

      <div className="relative">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Historias de exito
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIndex === 0}
                aria-label="Testimonio anterior"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={activeIndex === testimonials.length - 1}
                aria-label="Siguiente testimonio"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width carousel */}
        <div ref={viewportRef} className="relative mt-16 overflow-hidden">
          <motion.div
            ref={trackRef}
            drag="x"
            dragConstraints={{ left: -maxDrag, right: 0 }}
            dragElastic={0.06}
            animate={{ x: -activeOffset }}
            transition={{ type: 'spring', stiffness: 230, damping: 30 }}
            onDragEnd={(_, info) => {
              if (!cardPitch) return;

              const nextOffset = Math.max(
                0,
                Math.min(activeOffset - info.offset.x, maxDrag),
              );

              selectIndex(Math.round(nextOffset / cardPitch));
            }}
            className="flex gap-8 px-6 sm:px-8 lg:px-12"
          >
            {testimonials.map((item) => (
              <GlassCard
                key={`${item.name}-${item.outcome}`}
                variant="light"
                className="w-[min(86vw,44rem)] shrink-0 p-5 sm:p-6"
              >
                <div className="relative h-[320px] overflow-hidden rounded-[28px] bg-slate-100">
                  {item.imageUrl ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover object-[center_22%]"
                        loading="lazy"
                      />

                      <MediaOverlay />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.95),rgba(191,219,254,0.55)),radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.16),transparent_34%)]" />
                  )}

                  <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                    <div className="max-w-md rounded-[28px] border border-white/20 bg-white/12 p-6 text-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.55)] backdrop-blur-md">
                      <Quote className="h-5 w-5 text-white/90" />
                      <p className="mt-4 text-sm leading-6 text-white/92">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/70 pb-5">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">{item.role}</p>
                    </div>

                    <div
                      className={cn(
                        PILL_CLASS,
                        'inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-blue-700',
                      )}
                    >
                      Resultado
                    </div>
                  </div>

                  <blockquote className="text-2xl leading-9 tracking-[-0.03em] text-slate-900">
                    “{item.quote}”
                  </blockquote>

                  <div className={cn(CARD_INSET_CLASS, 'px-5 py-5')}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Outcome
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.outcome}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        </div>

        {/* Progress and counter */}
        <div className="mx-auto mt-14 flex max-w-7xl items-center gap-6 px-6 sm:px-8 lg:px-12">
          <div className="flex flex-1 items-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={`${item.name}-progress`}
                type="button"
                onClick={() => selectIndex(index)}
                aria-label={`Ir al testimonio ${index + 1}`}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition',
                  index === activeIndex
                    ? 'bg-slate-950'
                    : 'bg-slate-200 hover:bg-slate-300',
                )}
              />
            ))}
          </div>

          <span className="min-w-[3.5rem] text-sm font-medium text-slate-500">
            {activeIndex + 1} / {testimonials.length}
          </span>
        </div>

        {/* Bottom stats */}
        <div className="mx-auto mt-20 max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-10 border-t border-slate-200 pt-12 md:grid-cols-3">
            {outcomeStats.map((stat, index) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.45,
                  ease: 'easeOut',
                  delay: index * 0.08,
                }}
                className={
                  index !== 0
                    ? 'md:border-l md:border-slate-200 md:pl-10'
                    : ''
                }
              >
                <p className="font-display text-4xl tracking-[-0.04em] text-slate-400 sm:text-5xl">
                  {stat.value}
                </p>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500 sm:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
