import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section id="final-cta" className="bg-white px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="landing-panel relative overflow-hidden rounded-[40px] border border-white/20 bg-white/10 p-8 text-white/70 backdrop-blur-md sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_40%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                Empieza cuando quieras
              </div>
              <h2 className="mt-7 max-w-4xl font-display text-4xl leading-tight text-white sm:text-5xl lg:text-[4rem]">
                Tu tesis no necesita más caos. Necesita dirección.
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                Empieza con una ruta clara, apoyo inteligente y asesores disponibles
                cuando los necesites.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {['Ruta clara', 'Apoyo inteligente', 'Asesores disponibles'].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md"
                  >
                    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]"
                >
                  Crear mi cuenta
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white/85 backdrop-blur-md"
                >
                  Explorar asesores
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
