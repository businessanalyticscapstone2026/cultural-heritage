"use client"

import { useEffect, useState } from "react"
import MonitoringSummaryRow from "@/features/tourist-monitoring/components/monitoring-summary-row"
import DrillDownPanel from "@/features/tourist-monitoring/components/drill-down-panel"
import ActivityLogTable from "@/features/tourist-monitoring/components/activity-log-table"
import RecommendationMonitoringPanel from "@/features/tourist-monitoring/components/recommendation-monitoring-panel"
import DestinationPopularityPanel from "@/features/tourist-monitoring/components/destination-popularity-panel"
import UnderPromotedCallout from "@/features/tourist-monitoring/components/under-promoted-callout"
import type { MonitoringActivityType, MonitoringFilters, UnderPromotedSite } from "@/features/tourist-monitoring/types"
import { getUnderPromotedSitesAction } from "@/features/tourist-monitoring/actions/monitoring"

export default function MonitoringPageClient({
  searchParams,
  filters,
}: {
  searchParams: Record<string, string | undefined>
  filters: MonitoringFilters
}) {
  const [activeDrillDown, setActiveDrillDown] = useState<MonitoringActivityType | "all" | null>(null)
  const [underPromoted, setUnderPromoted] = useState<UnderPromotedSite[] | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getUnderPromotedSitesAction(searchParams)
      .then((d) => { if (!cancelled) setUnderPromoted(d) })
      .catch(() => { if (!cancelled) setUnderPromoted([]) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  const handleDrillDownToggle = (type: MonitoringActivityType | "all") => {
    setActiveDrillDown((prev) => (prev === type ? null : type))
  }

  return (
    <>
      <MonitoringSummaryRow
        key={`summary-${filterKey}`}
        searchParams={searchParams}
        activeDrillDown={activeDrillDown}
        onDrillDownToggle={handleDrillDownToggle}
      />

      {activeDrillDown && (
        <DrillDownPanel
          key={`drilldown-${filterKey}-${activeDrillDown}`}
          searchParams={searchParams}
          drillDownType={activeDrillDown}
          onClose={() => setActiveDrillDown(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityLogTable key={`activity-${filterKey}`} searchParams={searchParams} />
        <div className="space-y-6">
          <RecommendationMonitoringPanel key={`recs-${filterKey}`} searchParams={searchParams} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DestinationPopularityPanel key={`popularity-${filterKey}`} searchParams={searchParams} />
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
