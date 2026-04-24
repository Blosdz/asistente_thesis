import { useEffect, useRef, useState } from 'react';
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

import appIcon from '../../../page-icon.png';
import { heroStats, heroValueProps, heroVideoSrc } from './landingData';
import { useStoryScroll } from './SmoothScrollProvider';
import { MediaOverlay } from '../ui/cardPrimitives';

export default function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollToSection } = useStoryScroll();
  const { scrollYProgress } = useScroll();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const videoY = useTransform(
    scrollYProgress,
    [0, 0.18],
    [0, prefersReducedMotion ? 0 : -28],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Show video immediately when metadata is loaded
    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
    };

    // Fallback: show after a maximum wait time
    const timeoutId = setTimeout(() => {
      setVideoLoaded(true);
    }, 2000);

    const playVideo = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        await video.play();
      } catch {
        // Autoplay can fail on some browsers
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    void playVideo();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pt-36"
    >
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
              AppThesis te ayuda a definir el alcance, ordenar el proceso y avanzar con una ruta clara desde el inicio.
            </p>

            <button
              type="button"
              onClick={() => scrollToSection('assessment-funnel')}
              className="mt-9 inline-flex items-center gap-3 rounded-full border border-slate-950 bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(15,23,42,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_22px_50px_rgba(15,23,42,0.26)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Cotizar plan
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Right visual */}
          <motion.div
            style={{ y: videoY }}
            className="relative hidden lg:block"
          >
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/3">
            <div className="flex items-center gap-3 rounded-[30px] border border-white/80 bg-white/70 px-4 py-3 backdrop-blur-2xl shadow-[0_24px_70px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]">
              
              {/* Icon */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 shadow-inner">
                <img
                  src={appIcon}
                  alt="AppThesis"
                  className="h-10 w-10 object-contain"
                />
              </div>
          
              {/* Badge text */}
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-800">
                  IA Estructural para Tesis
                </span>
              </div>
          
            </div>
          </div>

            <div className="relative h-[590px] overflow-hidden rounded-[38px] border border-white/70 bg-gradient-to-br from-slate-200 to-slate-100 shadow-[0_34px_90px_rgba(15,23,42,0.16)]">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ display: videoLoaded ? 'block' : 'none' }}
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
