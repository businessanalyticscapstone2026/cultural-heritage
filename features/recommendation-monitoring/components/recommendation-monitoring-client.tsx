"use client"

import { useState } from "react"
import type { RecommendationMonitoringFilters } from "../types"
import RecommendationFunnelCard from "./recommendation-funnel-card"
import RecommendationSiteTable from "./recommendation-site-table"
import UnderPromotedPanel from "./under-promoted-panel"
import SiteRecommendationDrillDown from "./site-recommendation-drill-down"

interface RecommendationMonitoringClientProps {
  initialFilters: RecommendationMonitoringFilters
}

export default function RecommendationMonitoringClient({
  initialFilters,
}: RecommendationMonitoringClientProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {selectedSiteId && (
        <SiteRecommendationDrillDown
          siteId={selectedSiteId}
          filters={initialFilters}
          onClose={() => setSelectedSiteId(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecommendationFunnelCard filters={initialFilters} />
        <UnderPromotedPanel filters={initialFilters} />
      </div>

      <RecommendationSiteTable
        filters={initialFilters}
        onSiteClick={setSelectedSiteId}
      />
    </div>
  )
}
