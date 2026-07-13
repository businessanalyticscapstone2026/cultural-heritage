import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseFiltersFromSearchParams } from "@/features/analytics"
import FilterBar from "@/features/analytics/components/filter-bar"
import SummaryMetricsRow from "@/features/analytics/components/summary-metrics-row"
import VisitorTrendChart from "@/features/analytics/components/visitor-trend-chart"
import VisitsByMunicipalityPanel from "@/features/analytics/components/visits-by-municipality-panel"
import DemographicsRow from "@/features/analytics/components/demographics-row"
import TopCategoriesChart from "@/features/analytics/components/top-categories-chart"
import TopSitesTable from "@/features/analytics/components/top-sites-table"
import RecommendationFunnel from "@/features/analytics/components/recommendation-funnel"

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = parseFiltersFromSearchParams(params)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: categories } = await supabase
    .from("heritage_categories")
    .select("id, name")
    .order("name")

  const filterKey = JSON.stringify(params)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tourism Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Province-wide heritage tourism insights for the First District of Batangas
        </p>
      </div>

      <FilterBar categories={categories ?? []} />

      <SummaryMetricsRow key={`metrics-${filterKey}`} searchParams={params} />

      <VisitorTrendChart key={`trend-${filterKey}`} filters={filters} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VisitsByMunicipalityPanel key={`muni-${filterKey}`} filters={filters} />
        <RecommendationFunnel key={`funnel-${filterKey}`} filters={filters} />
      </div>

      <DemographicsRow key={`demo-${filterKey}`} filters={filters} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopCategoriesChart key={`cats-${filterKey}`} filters={filters} />
        <TopSitesTable key={`sites-${filterKey}`} filters={filters} />
      </div>
    </div>
  )
}
