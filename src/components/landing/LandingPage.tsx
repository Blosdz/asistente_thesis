import { lazy, Suspense, useMemo, useState } from 'react';

import Hero from './Hero';
import HowItWorks from './HowItWorks';
import PricingStory from './PricingStory';
import Plans from './Plans';
import AIShowcase from './AIShowcase';
import TrustSection from './TrustSection';
import FinalCTA from './FinalCTA';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import StoryNavbar from './StoryNavbar';
import StoryPopup from './StoryPopup';
import StoryScrollProgress from './StoryScrollProgress';
import { storySections } from './storySections';

const StoryPopupContent = lazy(() => import('./StoryPopupContent'));

export default function LandingPage() {
  const [popupOpen, setPopupOpen] = useState(false);
  const popupFallback = useMemo(
    () => (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[26px] border border-white/70 bg-white/78 p-6">
          <div className="h-4 w-20 rounded-full bg-slate-200/80" />
          <div className="mt-5 h-8 w-4/5 rounded-full bg-slate-200/80" />
          <div className="mt-4 h-4 w-full rounded-full bg-slate-200/70" />
          <div className="mt-3 h-4 w-3/4 rounded-full bg-slate-200/70" />
        </div>
        <div className="rounded-[26px] border border-white/70 bg-slate-950 p-6">
          <div className="h-4 w-24 rounded-full bg-white/15" />
          <div className="mt-5 h-10 w-1/2 rounded-full bg-white/10" />
          <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-2/3 rounded-full bg-white/10" />
        </div>
      </div>
    ),
    [],
  );

  return (
    <SmoothScrollProvider sections={storySections} offset={104}>
      <div className="landing-shell relative isolate overflow-hidden text-slate-900">
        <StoryScrollProgress />
        <StoryNavbar sections={storySections} onOpenStory={() => setPopupOpen(true)} />

        <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8fbff] via-[#eef5fb] to-[#edf4fb]" />
          <div className="absolute left-[-10%] top-[-8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96),rgba(59,130,246,0.14)_38%,transparent_72%)] blur-2xl" />
          <div className="absolute right-[-6%] top-[22%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),rgba(255,255,255,0.78)_36%,transparent_72%)] blur-2xl" />
          <div className="absolute bottom-[-10%] left-[18%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1),rgba(255,255,255,0.78)_36%,transparent_72%)] blur-2xl" />
          <div className="landing-mesh absolute inset-0 opacity-40" />
        </div>

        <main className="relative">
          <Hero onOpenStory={() => setPopupOpen(true)} />
          <HowItWorks />
          <PricingStory />
          <Plans />
          <AIShowcase onOpenStory={() => setPopupOpen(true)} />
          <TrustSection />
          <FinalCTA />
        </main>

        <StoryPopup
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          subtitle="Story demo"
          title="Misma historia. Menos ruido."
          size="xl"
        >
          <Suspense fallback={popupFallback}>
            <StoryPopupContent />
          </Suspense>
        </StoryPopup>
      </div>
    </SmoothScrollProvider>
  );
}
