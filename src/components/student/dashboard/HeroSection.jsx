import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CalendarClock } from 'lucide-react';

import { Card } from '../../ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HeroSection({
  loading,
  perfilNombre,
  resumenItems,
  progress,
  proximaCita,
  tesisActiva,
  onPrimaryCta,
  onSecondaryCta,
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-[36px] border border-white/70 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-6 shadow-[0_30px_70px_rgba(15,23,42,0.08)] sm:p-8"
    >
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div variants={reducedMotion ? undefined : itemVariants}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
            Dashboard Estudiante
          </p>
          <h1 className="mt-3 font-['Ubuntu'] text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {loading ? 'Cargando tu dashboard...' : `Hola, ${perfilNombre}`}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Visualiza tu avance, mantente al dia con tus reuniones y coordina tu
            tesis desde un solo espacio premium.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {resumenItems.map((item) => (
              <Card
                key={item.label}
                className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_15px_35px_rgba(15,23,42,0.06)] backdrop-blur"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  {loading ? '--' : item.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="ios-accent-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Continuar tesis
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSecondaryCta}
              className="ios-secondary-button inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Ver reuniones
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
        <motion.div variants={reducedMotion ? undefined : itemVariants}>
          <Card className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-blue-900 p-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <div className="absolute inset-0 bg-slate-900" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 " />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 backdrop-blur">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Workspace de tesis
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-white">
                  {tesisActiva?.titulo || 'Aún no tienes tesis activa'}
                </h2>
                <p className="text-lg font-bold text-white">
                  Centraliza reuniones, documentos, avances y observaciones
                  académicas desde un solo espacio de trabajo.
                </p>
              </div>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">
                    Estado actual
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-bold">
                      {tesisActiva?.estado || 'En progreso'}
                    </p>
                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Activa
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">
                      Próxima reunión
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {proximaCita?.asesorNombre || 'Sin reunión'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-100/70">
                      Documentos
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {resumenItems?.[2]?.value || '00'} archivos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onPrimaryCta}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-900 transition duration-300 hover:scale-[1.02]"
                >
                  Abrir workspace
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </motion.section>
  );
}
