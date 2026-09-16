import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Carousel from "@/components/Carousel";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import ExpertCTA from "@/components/ExpertCTA";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import DownloadCTA from "@/components/DownloadCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Carousel />
        <HowItWorks />
        <Features />
        <ExpertCTA />
        <Testimonials />
        <FAQ />
        <DownloadCTA />
      </main>
      <Footer />
    </>
  );
}
