import { motion, useReducedMotion } from 'motion/react';

import { Card } from '../../ui/card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const sizeStyles = {
  lg: 'sm:col-span-2',
  md: 'sm:col-span-1',
  sm: '',
};

export default function MetricsGrid({ items, loading }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            variants={reducedMotion ? undefined : itemVariants}
            className={sizeStyles[item.size || 'sm']}
          >
            <Card
              className={`flex h-full flex-col justify-between rounded-[26px] border border-white/80 p-6 shadow-[0_20px_45px_rgba(15,23,42,0.06)] ${item.tone}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80">
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900">
                  {loading ? '--' : item.value}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                  >
                    {item.note}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
