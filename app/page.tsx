import Header from "@/components/layout/header"
import HeroSection from "@/components/shared/hero-section"
import FeaturedMunicipalities from "@/components/shared/featured-municipalities"
import MapSection from "@/components/shared/map-section"
import RecommendedSection from "@/components/shared/recommended-section"
import AnnouncementsSection from "@/components/shared/announcements-section"
import SiteFooter from "@/components/layout/site-footer"
import { getHomePageData } from "@/features/heritage/services/home"

export default async function HomePage() {
  const data = await getHomePageData()

  return (
    <>
      <Header />
      <main>
        <HeroSection
          siteName={data.featuredSite?.siteName ?? null}
          heroImage={data.featuredSite?.heroImage ?? null}
        />
        <FeaturedMunicipalities municipalities={data.featuredMunicipalities} />
        <MapSection
          categories={data.categories}
          sites={data.mapSites}
          stats={data.stats}
        />
        <RecommendedSection sites={data.topSites} />
        <AnnouncementsSection />
      </main>
      <SiteFooter />
    </>
  )
}
