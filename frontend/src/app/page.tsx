import { SiteHeader } from "@/components/site-header"
import HeroSection from "@/components/HeroSection"
import HowItWorks from "@/components/HowItWorks"
import { AssessmentMockup } from "@/components/assessment-mockup"
import ResultsSection from "@/components/ResultsSection"
import SimulatorSection from "@/components/SimulatorSection"
import IndustryDemand from "@/components/IndustryDemand"
import { SiteFooter } from "@/components/site-footer"

// Landing page lives at the root "/". The "Start Assessment" CTAs route to the
// /gateway segment picker, which branches to the mock student / guest sign-in.
export default function Page() {
  return (
    <main className="relative bg-background">
      <SiteHeader />
      <HeroSection />
      <HowItWorks />
      <AssessmentMockup />
      <ResultsSection />
      <SimulatorSection />
      <IndustryDemand />
      <SiteFooter />
    </main>
  )
}
