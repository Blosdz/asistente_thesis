import { useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { heroStats, heroValueProps } from './landingData';
import { useStoryScroll } from './SmoothScrollProvider';
import { MediaOverlay } from '../ui/cardPrimitives';

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollToSection } = useStoryScroll();
  const { scrollYProgress } = useScroll();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const orbY = useTransform(
    scrollYProgress,
    [0, 0.18],
    [0, prefersReducedMotion ? 0 : 28],
  );

  const videoY = useTransform(
    scrollYProgress,
    [0, 0.18],
    [0, prefersReducedMotion ? 0 : -28],
  );

  const heroVideoSrc =
    'https://www.dropbox.com/scl/fi/hi1wfmjswag4lhvlpy4go/hero_video.mp4?rlkey=sgau15k7zh4o1smovxg0h8n9f&st=fkxsk9er&raw=1';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        // Autoplay can fail on some browsers. The poster/fallback background still works.
      }
    };

    void playVideo();
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden  px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pt-36  bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(224,239,255,0.72)_42%,rgba(191,219,254,0.78)_100%)]"
    >

      <motion.div
        aria-hidden="true"
        style={{ y: orbY }}
        className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[34rem] max-w-6xl rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_34%,rgba(2,132,199,0.12)_62%,transparent_74%)] blur-3xl"
      />

      <div className="relative mx-auto flex w-full max-w-7xl items-center">
        <div className="grid min-h-[calc(100svh-9rem)] w-full content-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14">
          {/* Left content */}
          <div className="max-w-3xl">
            {/* Social proof */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white bg-white/40 px-5 py-2.5 background-blur-lg">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-blue-500" />
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500" />
                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-purple-500" />
              </div>
              {/*<div class="mx-auto max-w-[15rem] rounded-[24px] border border-white/20 bg-white/12 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl transition duration-500 group-hover:-translate-y-1"><div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-[20px] bg-white/18"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-text h-5 w-5" aria-hidden="true"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path><path d="M7 11h10"></path><path d="M7 15h6"></path><path d="M7 7h8"></path></svg></div><div><p class="text-sm font-semibold leading-tight">Sustentación lista</p><p class="mt-1 text-xs text-white/65">Preparación final</p></div></div></div>*/}

              <span className="text-sm font-medium text-slate-600">
                +1000 estudiantes avanzan con AppThesis
              </span>
            </div>

            {/* Eyebrow */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              Asesoría académica + IA
            </div>

            {/* Headline */}
            <h1 className="mt-7 max-w-4xl font-display text-5xl leading-[0.94] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-[5.7rem]">
              Ordena tu tesis. Avanza con criterio.
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Cotización clara, orden en tus avances y defensa</p>

            {/* Bottom value props */}
            <div className="mt-10 grid gap-5 rounded-[32px] border border-white bg-white/40 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:grid-cols-3">
              {heroValueProps.map((item, index) => (
                <div
                  key={item.title}
                  className={index !== 0 ? 'sm:border-l sm:border-slate-200 sm:pl-5' : ''}
                >
                  <p className="text-sm font-bold text-slate-600">
                    {item.title}
                  </p>

                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <motion.div
            style={{ y: videoY }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[590px] overflow-hidden rounded-[38px] border border-white/70 bg-slate-100 shadow-[0_34px_90px_rgba(15,23,42,0.16)]">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={heroVideoSrc} type="video/mp4" />
              </video>

              <MediaOverlay />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
