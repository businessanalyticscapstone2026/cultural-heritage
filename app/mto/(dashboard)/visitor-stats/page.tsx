import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMTOFiltersFromSearchParams } from "@/features/mto-analytics"
import FilterBar from "@/features/mto-analytics/components/filter-bar"
import VisitorStatsVisualizations from "@/features/mto-analytics/components/visitor-stats-visualizations"

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Visitor Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Detailed visitor demographics and trends for your municipality.
        </p>
      </div>

      <div id="filter-settings">
        <FilterBar categories={categories ?? []} />
      </div>

      <VisitorStatsVisualizations filters={filters} filterKey={filterKey} />
    </div>
  )
}
