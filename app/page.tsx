import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturedMunicipalities from "@/components/featured-municipalities";
import MapSection from "@/components/map-section";
import RecommendedSection from "@/components/recommended-section";
import SiteFooter from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedMunicipalities />
        <MapSection />
        <RecommendedSection />
      </main>
      <SiteFooter />
    </>
  );
}
