import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

export default function LandingBackground() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const orbY = useTransform(
    scrollYProgress,
    [0, 0.18],
    [0, prefersReducedMotion ? 0 : 28],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(239,246,255,0.92)_22%,rgba(219,234,254,0.76)_48%,rgba(248,250,252,0.88)_72%,rgba(255,255,255,0.98)_100%)]" />

      <motion.div
        style={{ y: orbY }}
        className="absolute inset-x-0 top-10 mx-auto h-[34rem] max-w-6xl rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_34%,rgba(2,132,199,0.12)_62%,transparent_74%)] blur-3xl"
      />

      <div className="absolute left-[-8rem] top-[28rem] h-[26rem] w-[26rem] rounded-full bg-sky-200/20 blur-3xl" />
      <div className="absolute right-[-10rem] top-[62rem] h-[30rem] w-[30rem] rounded-full bg-blue-200/20 blur-3xl" />
    </div>
  );
}
