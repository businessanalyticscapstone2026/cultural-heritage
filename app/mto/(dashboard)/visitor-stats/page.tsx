import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMTOFiltersFromSearchParams } from "@/features/mto-analytics"
import FilterBar from "@/features/mto-analytics/components/filter-bar"
import SummaryMetricsRow from "@/features/mto-analytics/components/summary-metrics-row"
import VisitorStatsVisualizations from "@/features/mto-analytics/components/visitor-stats-visualizations"
import ExportPanel from "@/features/mto-analytics/components/export-panel"

export default async function VisitorStatsPage({
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
      {/* Header with breadcrumbs and export action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
            <span>Dashboard</span>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground font-medium">Visitor Statistics</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Visitor Statistics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detailed visitor demographics, volume metrics, and longitudinal trends for your municipality
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ExportPanel />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div id="filter-settings">
        <FilterBar categories={categories ?? []} />
      </div>

      {/* Key Metric Highlights */}
      <div id="summary-metrics">
        <SummaryMetricsRow key={`metrics-${filterKey}`} searchParams={params} />
      </div>

      {/* Visualizations Grid */}
      <VisitorStatsVisualizations filters={filters} filterKey={filterKey} />
    </div>
  )
}
