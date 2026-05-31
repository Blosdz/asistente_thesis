import { motion, useReducedMotion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function QuickActions({ actions }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            type="button"
            onClick={action.onClick}
            variants={reducedMotion ? undefined : itemVariants}
            whileHover={reducedMotion ? undefined : { y: -4 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            className={`group flex h-full flex-col items-start gap-3 rounded-3xl border border-white/70 bg-white/70 p-5 text-left shadow-[0_20px_45px_rgba(15,23,42,0.07)] backdrop-blur transition ${action.tone}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/80">
              <Icon className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{action.label}</p>
              <p className="mt-1 text-xs text-slate-500">{action.description}</p>
            </div>
          </motion.button>
        );
      })}
    </motion.section>
  );
}
