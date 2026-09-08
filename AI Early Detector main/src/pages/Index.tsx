import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import ParticlesBackground from "@/components/ParticlesBackground";

const Index = () => (
  <div className="min-h-screen bg-background relative">
    <ParticlesBackground />
    <Navbar />
    <HeroSection />
    <FeatureCards />
    <Footer />
  </div>
);

export default Index;
