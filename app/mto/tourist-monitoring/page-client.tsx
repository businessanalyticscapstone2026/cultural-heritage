"use client"

import { useEffect, useState } from "react"
import MonitoringSummaryRow from "@/features/tourist-monitoring/components/monitoring-summary-row"
import DrillDownPanel from "@/features/tourist-monitoring/components/drill-down-panel"
import ActivityLogTable from "@/features/tourist-monitoring/components/activity-log-table"
import RecommendationMonitoringPanel from "@/features/tourist-monitoring/components/recommendation-monitoring-panel"
import DestinationPopularityPanel from "@/features/tourist-monitoring/components/destination-popularity-panel"
import UnderPromotedCallout from "@/features/tourist-monitoring/components/under-promoted-callout"
import type { MonitoringActivityType, MonitoringFilters, UnderPromotedSite, TouristMonitoringBundle } from "@/features/tourist-monitoring/types"
import { getUnderPromotedSitesAction } from "@/features/tourist-monitoring/actions/monitoring"

export default function MonitoringPageClient({
  searchParams,
  filters,
  initialData,
}: {
  searchParams: Record<string, string | undefined>
  filters: MonitoringFilters
  initialData?: TouristMonitoringBundle
}) {
  const [activeDrillDown, setActiveDrillDown] = useState<MonitoringActivityType | "all" | null>(null)
  const [underPromoted, setUnderPromoted] = useState<UnderPromotedSite[] | null>(initialData?.underPromoted ?? null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (initialData) {
      setUnderPromoted(initialData.underPromoted)
      return
    }

    let cancelled = false
    getUnderPromotedSitesAction(searchParams)
      .then((d) => { if (!cancelled) setUnderPromoted(d) })
      .catch(() => { if (!cancelled) setUnderPromoted([]) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, filterKey])

  const handleDrillDownToggle = (type: MonitoringActivityType | "all") => {
    setActiveDrillDown((prev) => (prev === type ? null : type))
  }

  return (
    <>
      <MonitoringSummaryRow
        searchParams={searchParams}
        activeDrillDown={activeDrillDown}
        onDrillDownToggle={handleDrillDownToggle}
        initialMetrics={initialData?.summary?.metrics}
      />

      {activeDrillDown && (
        <DrillDownPanel
          searchParams={searchParams}
          drillDownType={activeDrillDown}
          onClose={() => setActiveDrillDown(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityLogTable searchParams={searchParams} initialData={initialData?.recentActivity} />
        <div className="space-y-6">
          <RecommendationMonitoringPanel searchParams={searchParams} initialData={initialData?.recommendationPerf} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DestinationPopularityPanel searchParams={searchParams} initialData={initialData?.popularity} />
        </div>
        <div>
          {underPromoted && underPromoted.length > 0 && (
            <UnderPromotedCallout sites={underPromoted} />
          )}
        </div>
      </div>
    </>
  )
}
