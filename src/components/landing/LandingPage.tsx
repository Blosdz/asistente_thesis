import { useEffect } from 'react';

import ScrollProgress from '../ui/ScrollProgress';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import HowItWorksIntro from './HowItWorksIntro';
import HowItWorksNarrative from './HowItWorksNarrative';
import ProductModulesSection from './ProductModulesSection';
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

    const preconnectUrls = ['https://dl.dropboxusercontent.com'];
    const preconnectLinks = preconnectUrls.map((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    });

    return () => {
      document.body.classList.remove('landing-page');
      preconnectLinks.forEach((link) => link.remove());
    };
  }, []);

  return (
    <SmoothScrollProvider sections={landingSections} offset={112}>
      <div className="landing-shell-light relative isolate overflow-x-hidden bg-[#f4efe8]">
        <ScrollProgress />
        <LandingNavbar />

        <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f3ec_0%,#f4efe8_36%,#efe8de_100%)]" />
          <div className="absolute inset-0 opacity-90 bg-[radial-gradient(circle_at_20%_30%,rgba(255,220,200,0.42),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(220,235,255,0.3),transparent_24%),radial-gradient(circle_at_70%_80%,rgba(255,240,200,0.32),transparent_26%),radial-gradient(circle_at_10%_80%,rgba(210,240,220,0.28),transparent_24%)]" />
          <div className="absolute left-[-12%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(215,178,155,0.32),transparent_72%)] blur-3xl" />
          <div className="absolute right-[-10%] top-[10%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(207,219,234,0.28),transparent_72%)] blur-3xl" />
          <div className="absolute bottom-[-18%] left-[8%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(228,205,177,0.3),transparent_74%)] blur-3xl" />
          <div className="absolute bottom-[8%] right-[4%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(201,222,204,0.24),transparent_72%)] blur-3xl" />
        </div>

        <main className="relative overflow-visible">
          <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(224,239,255,0.72)_28%,rgba(191,219,254,0.78)_48%,rgba(224,239,255,0.72)_70%,rgba(255,255,255,0.96)_100%)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.94),rgba(59,130,246,0.16)_18%,transparent_38%),radial-gradient(circle_at_16%_58%,rgba(255,255,255,0.62),rgba(59,130,246,0.14)_22%,transparent_42%),radial-gradient(circle_at_84%_66%,rgba(186,230,253,0.42),rgba(59,130,246,0.14)_24%,transparent_44%)]"
            />
            <HeroSection />
            <AssessmentFunnel />
          </div>
          <HowItWorksIntro />
          <HowItWorksNarrative />
          <ProductModulesSection />
          <Plans />
          {/*<PlansSection >*/}
          <AdvisorsSection />
          <OutcomesSection />
        </main>

      </div>
    </SmoothScrollProvider>
  );
}
