import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMTOFiltersFromSearchParams } from "@/features/mto-analytics"
import FilterBar from "@/features/mto-analytics/components/filter-bar"
import SummaryMetricsRow from "@/features/mto-analytics/components/summary-metrics-row"
import VisitorTrendChart from "@/features/mto-analytics/components/visitor-trend-chart"
import VisitsByAttractionPanel from "@/features/mto-analytics/components/visits-by-attraction-panel"
import DemographicsRow from "@/features/mto-analytics/components/demographics-row"
import TopSitesTable from "@/features/mto-analytics/components/top-sites-table"
import RecommendationFunnel from "@/features/mto-analytics/components/recommendation-funnel"
import ExportPanel from "@/features/mto-analytics/components/export-panel"

export default async function MTOAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = parseMTOFiltersFromSearchParams(params)

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
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <span>Dashboard</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">Analytics</span>
        </nav>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Municipal Tourism Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Local tourism insights for your municipality
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_240px]">
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

          <div id="visits-by-attraction" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <VisitsByAttractionPanel key={`attraction-${filterKey}`} filters={filters} />
            <div id="recommendation-funnel">
              <RecommendationFunnel key={`funnel-${filterKey}`} filters={filters} />
            </div>
          </div>

          <div id="demographics">
            <DemographicsRow key={`demo-${filterKey}`} filters={filters} />
          </div>

          <div id="top-sites">
            <TopSitesTable key={`sites-${filterKey}`} filters={filters} />
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
