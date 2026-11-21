import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMTOFiltersFromSearchParams, type TrendGranularity } from "@/features/mto-analytics"
import { resolveMunicipalityId, getAllMTOAnalyticsData } from "@/features/mto-analytics/services"
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
  const granularity = (params.granularity as TrendGranularity) ?? "monthly"

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const municipalityId = await resolveMunicipalityId()

  const [{ data: categories }, bundle] = await Promise.all([
    supabase
      .from("heritage_categories")
      .select("id, name")
      .order("name"),
    getAllMTOAnalyticsData(municipalityId, filters, granularity),
  ])

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

      <VisitorStatsVisualizations filters={filters} filterKey={filterKey} initialData={bundle} />
    </div>
  )
}
