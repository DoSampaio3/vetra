import Hero from '@/components/marketing/sections/Hero';
import Problem from '@/components/marketing/sections/Problem';
import Solution from '@/components/marketing/sections/Solution';
import Benefits from '@/components/marketing/sections/Benefits';
import SocialProof from '@/components/marketing/sections/SocialProof';
import Pricing from '@/components/marketing/sections/Pricing';
import FAQ from '@/components/marketing/sections/FAQ';
import FinalCTA from '@/components/marketing/sections/FinalCTA';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <Benefits />
      <SocialProof />
      <Pricing />
      <FAQ />
      <FinalCTA />
    </>
  );
}
