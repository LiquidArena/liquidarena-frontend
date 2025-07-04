import FooterConnector from "@/components/ui/footer-connector";
import FaqSection from "@/components/view/homepage/faq-section";
import HeroSection from "@/components/view/homepage/hero-section";
import HowItWorksSection from "@/components/view/homepage/how-it-works-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <HeroSection />
      <HowItWorksSection />
      <FaqSection />
      <FooterConnector />
    </main>
  );
}
