import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { parseMonitoringFilters } from "@/features/tourist-monitoring"
import { getTouristMonitoringBundle } from "@/features/tourist-monitoring/services"
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

  // Resolve the authenticated MTO user's municipality so the site filter
  // dropdown only shows sites they are authorised to see.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const municipalityId = profile?.municipality_id ?? ""

  const [{ data: categories }, { data: sites }, bundle] = await Promise.all([
    supabase.from("heritage_categories").select("id, name").order("name"),
    supabase
      .from("heritage_sites")
      .select("id, site_name")
      .eq("municipality_id", municipalityId)
      .order("site_name"),
    municipalityId
      ? getTouristMonitoringBundle(municipalityId, filters)
      : Promise.resolve(undefined),
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

      <MonitoringPageClient searchParams={params} filters={filters} initialData={bundle} />
    </div>
  )
}
