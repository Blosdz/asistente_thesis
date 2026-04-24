import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import { MediaOverlay } from '../ui/cardPrimitives';
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

// Duplicate testimonials for seamless infinite loop
const carouselItems = [...testimonials, ...testimonials];

const AUTO_SCROLL_SPEED = 48;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

export default function OutcomesSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const loopPoint = carousel.scrollWidth / 2;
    const scrollAmount = Math.min(carousel.clientWidth * 0.85, 720);

    if (direction === 'left' && carousel.scrollLeft <= scrollAmount) {
      carousel.scrollLeft += loopPoint;
    }

    if (direction === 'right' && carousel.scrollLeft + scrollAmount >= loopPoint) {
      carousel.scrollLeft -= loopPoint;
    }

    carousel.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!carousel || prefersReducedMotion) return undefined;

    let animationFrame = 0;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && !isHoveringCard) {
        const loopPoint = carousel.scrollWidth / 2;
        if (loopPoint <= 0) return;

        carousel.scrollLeft += (AUTO_SCROLL_SPEED * delta) / 1000;

        if (carousel.scrollLeft >= loopPoint) {
          carousel.scrollLeft -= loopPoint;
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, isHoveringCard]);

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
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Conoce las experiencias de estudiantes que transformaron sus tesis con asesoría especializada.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Ver historia anterior"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                title={isPaused ? 'Presiona SPACE para reanudar' : 'Presiona SPACE para pausar'}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Ver siguiente historia"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width infinite carousel */}
        <div className="relative mt-16 overflow-hidden">
          <div
            ref={carouselRef}
            className="flex gap-8 overflow-x-auto px-6 pb-4 sm:px-8 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselItems.map((item, index) => (
              <GlassCard
                key={`${item.name}-${item.outcome}-${index}`}
                variant="light"
                className="group relative w-[min(86vw,520px)] shrink-0 overflow-hidden p-3 sm:w-[560px] lg:w-[640px]"
                onMouseEnter={() => setIsHoveringCard(true)}
                onMouseLeave={() => setIsHoveringCard(false)}
              >
                <div className="relative grid min-h-[320px] overflow-hidden rounded-[24px] bg-white sm:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
                  <div className="relative h-[320px] overflow-hidden bg-slate-50 sm:h-full">
                    {item.imageUrl ? (
                      <>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <MediaOverlay />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.95),rgba(191,219,254,0.55)),radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.16),transparent_34%)]" />
                    )}

                    <div className="absolute left-4 top-4 z-10 inline-flex max-w-[calc(100%-2rem)] rounded-[18px] border border-white/20 bg-white/14 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-xl">
                      {item.badge}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                      Historia destacada
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-base leading-6 text-slate-600">
                      {item.role}
                    </p>
                  </div>

                  <div className="absolute inset-0 z-20 hidden translate-y-4 overflow-y-auto bg-slate-950/78 p-5 opacity-0 backdrop-blur-sm transition duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:flex sm:flex-col sm:justify-center lg:p-7">
                    <blockquote className="text-sm font-medium leading-6 tracking-[-0.02em] text-white sm:text-base sm:leading-7">
                      “{item.quote}”
                    </blockquote>

                    <div className="mt-4 rounded-[20px] border border-white/15 bg-white/12 p-4 text-white shadow-sm backdrop-blur-xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                        Reseña
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/88">
                        {item.outcome}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-[22px] border border-slate-200/70 bg-white/78 p-4 shadow-sm sm:hidden">
                  <blockquote className="text-sm leading-6 text-slate-800">
                    “{item.quote}”
                  </blockquote>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Outcome
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.outcome}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
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
