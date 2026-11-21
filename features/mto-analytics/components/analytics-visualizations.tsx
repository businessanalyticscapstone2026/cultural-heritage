"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { MTOAnalyticsFilters, MTOAnalyticsBundle } from "../types"

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
  initialData,
}: {
  filters: MTOAnalyticsFilters
  filterKey?: string
  initialData?: MTOAnalyticsBundle
}) {
  return (
    <div className="space-y-6">
      <div id="visitor-trend">
        <VisitorTrendChart filters={filters} initialData={initialData?.visitorTrend} />
      </div>

      <div id="visitor-trend-comparison" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitorTrendComparison filters={filters} initialData={initialData?.visitorTrendComparison} />
        </div>
        <div id="weekday">
          <WeekdayBarChart filters={filters} initialData={initialData?.weekdayVisits} />
        </div>
      </div>

      <div id="visits-by-attraction" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <VisitsByAttractionPanel filters={filters} initialData={initialData?.visitsByAttraction} />
        <div id="recommendation-funnel">
          <RecommendationFunnel filters={filters} initialData={initialData?.recommendationFunnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div id="scan-device">
          <ScanDeviceChart filters={filters} initialData={initialData?.scanDeviceBreakdown} />
        </div>
        <div className="lg:col-span-2">
          <div id="demographics">
            <DemographicsRow filters={filters} initialData={initialData?.demographics} />
          </div>
        </div>
      </div>

      <div id="top-sites">
        <TopSitesTable filters={filters} initialData={initialData?.topSites} />
      </div>
    </div>
  )
}
