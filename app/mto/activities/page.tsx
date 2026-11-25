import {
  resolveMTOUserId,
  getMonitoringSites,
  getMonitoringCategories,
} from "@/features/tourist-monitoring/services"
import MonitoringFilterBar from "@/features/tourist-monitoring/components/monitoring-filter-bar"
import ActivityLogTable from "@/features/tourist-monitoring/components/activity-log-table"

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams

  let municipalityId: string
  try {
    ;({ municipalityId } = await resolveMTOUserId())
  } catch {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Tourist Activities</h1>
        <p className="text-sm text-muted-foreground">
          Your staff account is not linked to a municipality yet. Please contact your PTCAO
          administrator to complete your account setup.
        </p>
      </div>
    )
  }

  const [categories, sites] = await Promise.all([
    getMonitoringCategories(),
    getMonitoringSites(municipalityId),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Tourist Activities
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor tourist visits, scans, bookmarks, and reviews across your municipality.
        </p>
      </div>

      <MonitoringFilterBar categories={categories} sites={sites} />

      <ActivityLogTable searchParams={params} />
    </div>
  )
}
