import { useEffect } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';

import { useStoryScroll } from './SmoothScrollProvider';

export default function StoryScrollProgress() {
  const { pageProgress } = useStoryScroll();
  const reducedMotion = useReducedMotion();
  const scaleX = useSpring(0, {
    stiffness: reducedMotion ? 150 : 190,
    damping: reducedMotion ? 32 : 26,
    mass: 0.2,
  });

  useEffect(() => {
    scaleX.set(pageProgress);
  }, [pageProgress, scaleX]);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-px bg-slate-200/75" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-gradient-to-r from-sky-500 via-blue-600 to-slate-950"
        style={{ scaleX }}
      />
    </>
  );
}
