import dynamic from "next/dynamic"
import { unstable_cache } from "next/cache"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { parseFiltersFromSearchParams } from "@/features/analytics"
import FilterBar from "@/features/analytics/components/filter-bar"
import SummaryMetricsRow from "@/features/analytics/components/summary-metrics-row"
import TopSitesTable from "@/features/analytics/components/top-sites-table"
import RecommendationFunnel from "@/features/analytics/components/recommendation-funnel"
import ExportPanel from "@/features/analytics/components/export-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"

const VisitorTrendChart = dynamic(
  () => import("@/features/analytics/components/visitor-trend-chart"),
  { loading: () => <Skeleton className="h-[360px] w-full rounded-xl" /> },
)
const VisitsByMunicipalityPanel = dynamic(
  () => import("@/features/analytics/components/visits-by-municipality-panel"),
  { loading: () => <Skeleton className="h-[320px] w-full rounded-xl" /> },
)
const DemographicsRow = dynamic(
  () => import("@/features/analytics/components/demographics-row"),
  { loading: () => <Skeleton className="h-[280px] w-full rounded-xl" /> },
)
const TopCategoriesChart = dynamic(
  () => import("@/features/analytics/components/top-categories-chart"),
  { loading: () => <Skeleton className="h-[320px] w-full rounded-xl" /> },
)

const getCachedCategories = unstable_cache(
  async (accessToken: string) => {
    const supabase = createTokenClient(accessToken)
    const { data } = await supabase
      .from("heritage_categories")
      .select("id, name")
      .order("name")
    return data ?? []
  },
  ["analytics-categories"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.heritageCategories] },
)

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = parseFiltersFromSearchParams(params)

  const accessToken = await resolveAccessToken()
  const categories = await getCachedCategories(accessToken)

  const filterKey = JSON.stringify(params)

  return (
    <div className="space-y-6">
      <div id="header-banner" className="rounded-xl bg-primary p-6 text-primary-foreground print:bg-white print:text-black">
        <h1 className="text-2xl font-bold">Tourism Analytics</h1>
        <p className="mt-1 text-sm opacity-80">
          Province-wide heritage tourism insights for the First District of Batangas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div id="filter-settings">
            <FilterBar categories={categories ?? []} />
          </div>

          <div id="summary-metrics">
            <SummaryMetricsRow key={`metrics-${filterKey}`} searchParams={params} />
          </div>

          <div id="visitor-trend">
            <VisitorTrendChart key={`trend-${filterKey}`} filters={filters} />
          </div>

          <div id="visits-by-municipality" className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            <VisitsByMunicipalityPanel key={`muni-${filterKey}`} filters={filters} />
            <div id="recommendation-funnel" className="h-full">
              <RecommendationFunnel key={`funnel-${filterKey}`} filters={filters} />
            </div>
          </div>

          <div id="demographics">
            <DemographicsRow key={`demo-${filterKey}`} filters={filters} />
          </div>

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            <div id="top-categories" className="h-full">
              <TopCategoriesChart key={`cats-${filterKey}`} filters={filters} />
            </div>
            <div id="top-sites" className="h-full">
              <TopSitesTable key={`sites-${filterKey}`} filters={filters} />
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-6">
            <ExportPanel />
          </div>
        </aside>
      </div>
    </div>
  )
}
