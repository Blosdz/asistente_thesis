import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reducedMotion ? 140 : 180,
    damping: reducedMotion ? 34 : 28,
    mass: 0.2,
  });

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px bg-slate-200/80" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-gradient-to-r from-sky-500 via-blue-600 to-slate-950"
        style={{ scaleX }}
      />
    </>
  );
}
