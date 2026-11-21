"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { MTOAnalyticsFilters } from "../types"

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full rounded-xl" />

const VisitorTrendChart = dynamic(() => import("./visitor-trend-chart"), {
  ssr: false,
  loading: ChartSkeleton,
})
const VisitorTrendComparison = dynamic(() => import("./visitor-trend-comparison"), {
  ssr: false,
  loading: ChartSkeleton,
})
const WeekdayBarChart = dynamic(() => import("./weekday-bar-chart"), {
  ssr: false,
  loading: ChartSkeleton,
})
const VisitsByAttractionPanel = dynamic(() => import("./visits-by-attraction-panel"), {
  ssr: false,
  loading: ChartSkeleton,
})
const ScanDeviceChart = dynamic(() => import("./scan-device-chart"), {
  ssr: false,
  loading: ChartSkeleton,
})
const DemographicsRow = dynamic(() => import("./demographics-row"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  ),
})
const TopSitesTable = dynamic(() => import("./top-sites-table"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  ),
})
const RecommendationFunnel = dynamic(() => import("./recommendation-funnel"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  ),
})

export default function AnalyticsVisualizations({
  filters,
  filterKey,
}: {
  filters: MTOAnalyticsFilters
  filterKey: string
}) {
  return (
    <div className="space-y-8">
      {/* Trends & Longitudinal Comparison */}
      <section className="space-y-4">
        <div id="visitor-trend">
          <VisitorTrendChart key={`trend-${filterKey}`} filters={filters} />
        </div>

        <div id="visitor-trend-comparison" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VisitorTrendComparison key={`comparison-${filterKey}`} filters={filters} />
          </div>
          <div id="weekday">
            <WeekdayBarChart key={`weekday-${filterKey}`} filters={filters} />
          </div>
        </div>
      </section>

      {/* Attraction Visits & Recommendation Funnel */}
      <section className="space-y-4">
        <div id="visits-by-attraction" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <VisitsByAttractionPanel key={`attraction-${filterKey}`} filters={filters} />
          <div id="recommendation-funnel">
            <RecommendationFunnel key={`funnel-${filterKey}`} filters={filters} />
          </div>
        </div>
      </section>

      {/* Scans by Device & Demographics Breakdown */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div id="scan-device">
            <ScanDeviceChart key={`scan-device-${filterKey}`} filters={filters} />
          </div>
          <div className="lg:col-span-2">
            <div id="demographics">
              <DemographicsRow key={`demo-${filterKey}`} filters={filters} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Performing Heritage Sites */}
      <section className="space-y-4">
        <div id="top-sites">
          <TopSitesTable key={`sites-${filterKey}`} filters={filters} />
        </div>
      </section>
    </div>
  )
}
