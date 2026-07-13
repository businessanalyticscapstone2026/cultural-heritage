import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMonitoringFilters } from "@/features/tourist-monitoring"
import MonitoringFilterBar from "@/features/tourist-monitoring/components/monitoring-filter-bar"
import MonitoringPageClient from "./page-client"

export default async function TouristMonitoringPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const filters = parseMonitoringFilters(params)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: categories }, { data: sites }] = await Promise.all([
    supabase.from("heritage_categories").select("id, name").order("name"),
    supabase.from("heritage_sites").select("id, site_name").order("site_name"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tourist Monitoring
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor tourist activities, recommendation performance, and destination popularity
        </p>
      </div>

      <MonitoringFilterBar
        categories={categories ?? []}
        sites={(sites ?? []).map((s) => ({ id: s.id as string, name: s.site_name as string }))}
      />

      <MonitoringPageClient searchParams={params} filters={filters} />
    </div>
  )
}
