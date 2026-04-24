import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Lenis as ReactLenis, type LenisRef } from 'lenis/react';
import { useMotionValueEvent, useScroll } from 'motion/react';

import type { StorySectionConfig } from './storySections';

type ScrollDirection = 'up' | 'down';
type SectionPhase = 'idle' | 'entered' | 'active' | 'leaving';

type StoryScrollContextValue = {
  activeSection: string;
  pageProgress: number;
  scrollToSection: (id: string) => void;
  getSectionPhase: (id: string) => SectionPhase;
  lockScroll: (reason: string) => void;
  unlockScroll: (reason: string) => void;
};

type SmoothScrollProviderProps = {
  children: ReactNode;
  sections: StorySectionConfig[];
  offset?: number;
};

const LEAVING_DELAY_MS = 320;
const StoryScrollContext = createContext<StoryScrollContextValue | null>(null);

const buildSectionStates = (
  sections: StorySectionConfig[],
  activeId: string,
  leavingId?: string | null,
) => {
  const activeIndex = sections.findIndex((section) => section.id === activeId);
  const states = Object.fromEntries(
    sections.map((section) => [section.id, 'idle' as SectionPhase]),
  );

  sections.forEach((section, index) => {
    if (section.id === activeId) {
      states[section.id] = 'active';
      return;
    }

    if (leavingId && section.id === leavingId) {
      states[section.id] = 'leaving';
      return;
    }

    if (index < activeIndex) {
      states[section.id] = 'entered';
    }
  });

  return states;
};

export function SmoothScrollProvider({
  children,
  sections,
  offset = 104,
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const [pageProgress, setPageProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const [sectionStates, setSectionStates] = useState<Record<string, SectionPhase>>(() =>
    buildSectionStates(sections, sections[0]?.id ?? ''),
  );
  const activeSectionRef = useRef(activeSection);
  const lastScrollRef = useRef(0);
  const directionRef = useRef<ScrollDirection>('down');
  const leavingTimeoutRef = useRef<number | null>(null);
  const measureFrameRef = useRef<number | null>(null);
  const lockReasonsRef = useRef<Set<string>>(new Set());
  const [scrollLocked, setScrollLocked] = useState(false);

  const transitionToSection = useCallback(
    (nextSectionId: string) => {
      if (!nextSectionId || nextSectionId === activeSectionRef.current) {
        return;
      }

      const previousSectionId = activeSectionRef.current;
      const nextIndex = sections.findIndex((section) => section.id === nextSectionId);
      const previousIndex = sections.findIndex((section) => section.id === previousSectionId);

      if (leavingTimeoutRef.current) {
        window.clearTimeout(leavingTimeoutRef.current);
      }

      activeSectionRef.current = nextSectionId;
      setActiveSection(nextSectionId);
      setSectionStates(buildSectionStates(sections, nextSectionId, previousSectionId));

      if (previousSectionId) {
        window.dispatchEvent(
          new CustomEvent('story:section-leave', {
            detail: {
              id: previousSectionId,
              nextId: nextSectionId,
              direction: directionRef.current,
            },
          }),
        );
      }

      window.dispatchEvent(
        new CustomEvent('story:section-enter', {
          detail: {
            id: nextSectionId,
            previousId: previousSectionId,
            direction: directionRef.current,
          },
        }),
      );

      if (previousSectionId) {
        leavingTimeoutRef.current = window.setTimeout(() => {
          setSectionStates((current) => {
            if (current[previousSectionId] !== 'leaving') {
              return current;
            }

            return {
              ...current,
              [previousSectionId]: previousIndex < nextIndex ? 'entered' : 'idle',
            };
          });
        }, LEAVING_DELAY_MS);
      }
    },
    [sections],
  );

  const measureActiveSection = useCallback(() => {
    if (!sections.length) {
      return;
    }

    const threshold = Math.max(offset + 28, window.innerHeight * 0.38);
    let nextActiveId = sections[0]?.id ?? '';
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const containsThreshold = rect.top <= threshold && rect.bottom >= threshold;
      const distance = Math.abs(rect.top - threshold);

      if (containsThreshold) {
        nextActiveId = section.id;
        closestDistance = -1;
        return;
      }

      if (closestDistance === -1) {
        return;
      }

      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveId = section.id;
      }
    });

    transitionToSection(nextActiveId);
  }, [offset, sections, transitionToSection]);

  const scheduleMeasure = useCallback(() => {
    if (measureFrameRef.current) {
      return;
    }

    measureFrameRef.current = window.requestAnimationFrame(() => {
      measureFrameRef.current = null;
      measureActiveSection();
    });
  }, [measureActiveSection]);

  const scrollToSection = useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const lenis = lenisRef.current?.lenis;
      const targetTop = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - offset,
      );

      if (lenis) {
        lenis.scrollTo(targetTop, {
          duration: prefersReducedMotion ? 0.45 : 1.05,
          immediate: false,
        });
        return;
      }

      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [offset],
  );

  const lockScroll = useCallback((reason: string) => {
    lockReasonsRef.current.add(reason);
    setScrollLocked(lockReasonsRef.current.size > 0);
  }, []);

  const unlockScroll = useCallback((reason: string) => {
    lockReasonsRef.current.delete(reason);
    setScrollLocked(lockReasonsRef.current.size > 0);
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setPageProgress(Math.min(1, Math.max(0, latest)));
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    directionRef.current = latest >= lastScrollRef.current ? 'down' : 'up';
    lastScrollRef.current = latest;
    scheduleMeasure();
  });

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    document.body.classList.add('landing-page');
    scheduleMeasure();

    const handleResize = () => scheduleMeasure();
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.classList.remove('landing-page');
      window.removeEventListener('resize', handleResize);

      if (measureFrameRef.current) {
        window.cancelAnimationFrame(measureFrameRef.current);
      }

      if (leavingTimeoutRef.current) {
        window.clearTimeout(leavingTimeoutRef.current);
      }
    };
  }, [scheduleMeasure]);

  useEffect(() => {
    document.documentElement.classList.toggle('story-ui-locked', scrollLocked);
    document.body.classList.toggle('story-ui-locked', scrollLocked);
    document.body.style.overflow = scrollLocked ? 'hidden' : '';

    const lenis = lenisRef.current?.lenis;
    if (lenis) {
      if (scrollLocked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }

    return () => {
      document.documentElement.classList.remove('story-ui-locked');
      document.body.classList.remove('story-ui-locked');
      document.body.style.overflow = '';
    };
  }, [scrollLocked]);

  const contextValue = useMemo<StoryScrollContextValue>(
    () => ({
      activeSection,
      pageProgress,
      scrollToSection,
      getSectionPhase: (id) => sectionStates[id] ?? 'idle',
      lockScroll,
      unlockScroll,
    }),
    [activeSection, lockScroll, pageProgress, scrollToSection, sectionStates, unlockScroll],
  );

  return (
    <StoryScrollContext.Provider value={contextValue}>
      <ReactLenis
        ref={lenisRef}
        root
        options={{
          autoRaf: true,
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: false,
          touchMultiplier: 1,
          wheelMultiplier: 1.08,
        }}
      >
        {children}
      </ReactLenis>
    </StoryScrollContext.Provider>
  );
}

export function useStoryScroll() {
  const context = useContext(StoryScrollContext);

  if (!context) {
    throw new Error('useStoryScroll must be used within SmoothScrollProvider');
  }

  return context;
}

export function useStorySection(id: string) {
  const { activeSection, getSectionPhase } = useStoryScroll();
  const phase = getSectionPhase(id);

  return {
    phase,
    isActive: activeSection === id,
  };
}
