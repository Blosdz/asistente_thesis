import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

import { cn } from '../../lib/cn';
import { plans } from './landingData';

export default function PlansSection() {
  return (
    <section id="planes" className="relative bg-white py-24 sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(59,130,246,0.08),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(96,165,250,0.1),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Planes
            </div>
            <h2 className="mt-6 font-display text-4xl leading-tight text-slate-900 sm:text-5xl">
              Elige el nivel de acompañamiento que mejor se adapta a tu tesis
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              Los planes del landing son comparativos y pensados para convertir la
              decisión en algo simple: estructura, guía o cobertura amplia.
            </p>
          </div>

          <a
            href="#/login"
            className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Ver mi acceso
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
              className={cn(
                'landing-panel flex h-full flex-col rounded-[34px] border border-white/20 bg-white/10 p-6 text-white/70 backdrop-blur-md sm:p-7',
                plan.featured &&
                'border-white/30 bg-white/12 shadow-[0_10px_30px_rgba(14,165,233,0.18)]',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-200">
                    Plan
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">{plan.title}</h3>
                </div>
                {plan.badge ? (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-md">
                    {plan.badge}
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-3xl font-semibold text-white">{plan.price}</p>
              <p className="mt-4 text-base leading-7 text-white/72">{plan.description}</p>

              <div className="mt-8 space-y-3">
                {plan.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="flex items-center gap-3 rounded-[22px] border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur-md"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-200">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    {bullet}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <a
                  href="#/signup"
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition',
                    plan.featured
                      ? 'bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_100%)] text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)]'
                      : 'border border-white/20 bg-white/10 text-white/85 backdrop-blur-md',
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
