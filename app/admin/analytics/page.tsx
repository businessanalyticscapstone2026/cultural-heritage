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
import ExportPanel from "@/features/analytics/components/export-panel"

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

          <div id="visits-by-municipality" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <VisitsByMunicipalityPanel key={`muni-${filterKey}`} filters={filters} />
            <div id="recommendation-funnel">
              <RecommendationFunnel key={`funnel-${filterKey}`} filters={filters} />
            </div>
          </div>

          <div id="demographics">
            <DemographicsRow key={`demo-${filterKey}`} filters={filters} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div id="top-categories">
              <TopCategoriesChart key={`cats-${filterKey}`} filters={filters} />
            </div>
            <div id="top-sites">
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
