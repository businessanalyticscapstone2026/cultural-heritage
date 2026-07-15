import { Suspense } from "react"
import type { Metadata } from "next"
import { getPublishedSites, getExploreCategories, getExploreFilterOptions } from "@/features/heritage/services/explore"
import { getGlobalSettingsPublic } from "@/features/settings/services"
import ExploreClient from "@/features/heritage/components/explore-client"
import ExploreSkeleton from "./loading"

export const metadata: Metadata = {
  title: "Explore Heritage Sites | Batangas Heritage",
  description:
    "Browse and search cultural heritage sites in the First District of Batangas. Discover historical landmarks, churches, museums, and more.",
}

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; category?: string; municipality?: string; period?: string; accessibility?: string; page?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const sp = await searchParams
  const searchQuery = sp.q ?? ""
  const categoryId = sp.category ?? ""
  const municipalityId = sp.municipality ?? ""
  const historicalPeriod = sp.period ?? ""
  const accessibility = sp.accessibility ?? ""
  const page = Math.max(1, Number(sp.page) || 1)

  const [globalSettings, categories, filterOptions] = await Promise.all([
    getGlobalSettingsPublic(),
    getExploreCategories(),
    getExploreFilterOptions(),
  ])

  const pageSize = globalSettings.itemsPerPage

  const initialData = await getPublishedSites({
    search: searchQuery || undefined,
    categoryId: categoryId || undefined,
    municipalityId: municipalityId || undefined,
    historicalPeriod: historicalPeriod || undefined,
    accessibility: accessibility || undefined,
    page,
    pageSize,
  })

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-8 lg:px-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-heading">
          Explore Heritage Sites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover the rich cultural heritage of the First District of Batangas
        </p>
      </div>

      <Suspense fallback={<ExploreSkeleton />}>
        <ExploreClient
          initialData={initialData}
          categories={categories}
          municipalities={filterOptions.municipalities}
          historicalPeriods={filterOptions.historicalPeriods}
          searchQuery={searchQuery}
          activeCategoryId={categoryId || null}
          activeMunicipalityId={municipalityId}
          activeHistoricalPeriod={historicalPeriod}
          activeAccessibility={accessibility}
        />
      </Suspense>
    </div>
  )
}
