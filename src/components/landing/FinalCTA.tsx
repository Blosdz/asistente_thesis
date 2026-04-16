import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

import GlassCard from '../ui/GlassCard';

export default function FinalCTA({ onNavigate }) {
  return (
    <section id="final-cta" className="px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <GlassCard className="overflow-hidden rounded-[40px] p-8 sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(168,85,247,0.16)_34%,transparent_65%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_38%)] rounded-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(59,130,246,0.14)_34%,transparent_65%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_38%)]  rounded-2xl" />
            <div className="relative p-5 rounded-full">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Empieza cuando quieras
              </div>
              <h2 className="mt-7 max-w-4xl font-display text-4xl leading-tight text-slate-950 sm:text-5xl lg:text-[4rem]">
                Empieza a estructurar tu tesis con claridad, criterio y apoyo
                inteligente.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                AppThesis combina organización visible, cotización según tu tesis y
                acompañamiento académico para que el proceso avance con más claridad.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {['Cotización según tu tesis', 'Observaciones ordenadas', 'Proceso más claro'].map(
                  (item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-sm font-medium text-slate-600"
                    >
                      <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
