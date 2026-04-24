import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '../../lib/cn';
import { MediaOverlay, PILL_CLASS } from '../ui/cardPrimitives';
import { advisorCards } from './landingData';

// Duplicate advisors for seamless infinite loop
const carouselItems = [...advisorCards, ...advisorCards];

const AUTO_SCROLL_SPEED = 48;

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

const advisorStats = [
  {
    value: 'Paso a paso',
    label: 'Acompañamiento desde la elección del tema hasta la sustentación.',
  },
  {
    value: 'Revisión experta',
    label: 'Observaciones claras sobre estructura, metodología y redacción.',
  },
  {
    value: 'Menos bloqueo',
    label: 'Convierte dudas académicas en tareas concretas para avanzar.',
  },
];

const advisorDescriptions = [
  'Te ayuda a definir enfoque, problema, objetivos, variables y estructura metodológica.',
  'Revisa coherencia, redacción académica, citas, estructura y claridad del documento.',
  'Te prepara para exponer, responder preguntas y defender tu proyecto con seguridad.',
];

export default function AdvisorsSection() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const loopPoint = carousel.scrollWidth / 2;
    const scrollAmount = Math.min(carousel.clientWidth * 0.85, 820);

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

      if (!isPaused) {
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
  }, [isPaused]);

  return (
    <section
      id="asesores"
      className="relative overflow-hidden bg-white py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#ffffff_100%)]" />

      <div className="relative">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-600">
                Asesoría especializada
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 shadow-[0_16px_38px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">
                  IA Estructural para Tesis
                </span>
              </div>

              <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                Asesores especializados cuando más los necesitas
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Conecta con especialistas que te ayudan a ordenar tu tema,
                corregir tu borrador y prepararte para sustentar con mayor
                seguridad.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Ver asesor anterior"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Ver siguiente asesor"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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
            className="flex gap-10 overflow-x-auto px-6 pb-8 sm:px-8 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselItems.map((advisor, index) => (
              <motion.article
                key={`${advisor.name}-${index}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: (index % advisorCards.length) * 0.06,
                }}
                className="group flex min-w-[86vw] snap-start flex-col gap-6 rounded-[32px] border border-slate-200/70 bg-white/72 p-5 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:min-w-[720px] sm:flex-row sm:gap-8 sm:p-6 lg:min-w-[780px]"
              >
                {/* Visual */}
                <div className="relative flex h-[280px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-slate-50 sm:w-[280px]">
                  {advisor.imageUrl ? (
                    <>
                      <img
                        src={advisor.imageUrl}
                        alt={advisor.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <MediaOverlay />

                      <div className="absolute left-4 top-4 inline-flex rounded-[20px] border border-white/20 bg-white/12 px-4 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-xl">
                        {advisor.badge}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-blue-100 bg-white shadow-[0_18px_50px_rgba(59,130,246,0.12)]">
                      <GraduationCap className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex min-h-[260px] flex-col justify-center py-2">
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <div className={cn(PILL_CLASS, 'inline-flex w-fit text-xs font-semibold text-blue-700')}>
                      {advisor.availability}
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-2 shadow-[0_12px_28px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.86)]">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        IA Estructural para Tesis
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                    {advisor.name}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {advisor.specialty}
                  </p>

                  <p className="mt-6 max-w-sm text-sm leading-6 text-slate-700">
                    {advisorDescriptions[index % advisorCards.length] ??
                      'Acompañamiento personalizado para avanzar con claridad en tu proyecto académico.'}
                  </p>

                  <div className="mt-6 grid gap-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      <span>{advisor.level}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Bottom info row */}
        <div className="mx-auto mt-20 max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-10 border-t border-slate-200 pt-12 md:grid-cols-3">
            {advisorStats.map((stat, index) => (
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
