import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      setProgress(Math.min(Math.max(nextProgress, 0), 1));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px bg-slate-200/80" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-gradient-to-r from-sky-500 via-blue-600 to-slate-950"
        style={{ transform: `scaleX(${progress})` }}
      />
    </>
  );
}
