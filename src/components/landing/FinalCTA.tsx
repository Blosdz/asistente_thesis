import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

import GlassCard from '../ui/GlassCard';
import StorySection from './StorySection';
import { useStoryScroll } from './SmoothScrollProvider';

export default function FinalCTA() {
  const { scrollToSection } = useStoryScroll();

  return (
    <StorySection id="final-cta" className="px-4 pb-16 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.992 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard className="overflow-hidden rounded-[40px] p-7 sm:p-9 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),rgba(59,130,246,0.14)_34%,transparent_65%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_38%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Listo para empezar
              </div>

              <h2 className="mt-7 max-w-4xl font-display text-4xl leading-tight text-slate-950 sm:text-5xl lg:text-[4rem]">
                Tu tesis puede sentirse mas clara desde hoy.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Ordena el caso, mira el precio y sigue con foco.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToSection('plans')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-950 to-blue-700 px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(37,99,235,0.22)]"
                >
                  Ver planes
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {['Precio claro', 'Feedback limpio', 'Ruta visible'].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/72 px-4 py-2 text-sm font-medium text-slate-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </StorySection>
  );
}
