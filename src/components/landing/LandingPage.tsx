import { useEffect } from 'react';

import ScrollProgress from '../ui/ScrollProgress';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import HowItWorksIntro from './HowItWorksIntro';
import HowItWorksNarrative from './HowItWorksNarrative';
//import PlansSection from './PlansSection';
import AdvisorsSection from './AdvisorsSection';
import OutcomesSection from './OutcomesSection';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import AssessmentFunnel from './AssessmentFunnel.tsx';
import Plans from './Plans.tsx';
import { landingSections } from './landingData';

export default function LandingPage() {
  useEffect(() => {
    document.body.classList.add('landing-page');

    return () => {
      document.body.classList.remove('landing-page');
    };
  }, []);

  const handleNavigate = (section: string) => {
    const target = document.getElementById(section);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 112;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    });
  };

  return (
    <SmoothScrollProvider sections={landingSections} offset={112}>
      <div className="landing-shell-light relative isolate overflow-x-hidden bg-white">
        <ScrollProgress />
        <LandingNavbar />

        <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_35%,#f8fbff_100%)]" />
          <div className="absolute left-[-12%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_72%)] blur-3xl" />
          <div className="absolute right-[-10%] top-[12%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.12),transparent_72%)] blur-3xl" />
          <div className="absolute bottom-[-16%] left-[12%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.1),transparent_74%)] blur-3xl" />
        </div>

        <main className="relative overflow-visible">
          <HeroSection />
          <HowItWorksIntro />
          <HowItWorksNarrative />
          <AssessmentFunnel onNavigate={handleNavigate} />
          <Plans/>
          {/*<PlansSection >*/}
          <AdvisorsSection />
          <OutcomesSection />
        </main>

      </div>
    </SmoothScrollProvider>
  );
}
