import Header from "@/components/layout/header"
import HeroSection from "@/components/shared/hero-section"
import FeaturedMunicipalities from "@/components/shared/featured-municipalities"
import MapSection from "@/components/shared/map-section"
import RecommendedSection from "@/components/shared/recommended-section"
import SiteFooter from "@/components/layout/site-footer"

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
  )
}
