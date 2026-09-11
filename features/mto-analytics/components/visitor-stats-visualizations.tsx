"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { MTOAnalyticsFilters } from "../types"

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full rounded-xl" />

const VisitorTrendChart = dynamic(() => import("./visitor-trend-chart"), {
  ssr: false,
  loading: ChartSkeleton,
})
const WeekdayBarChart = dynamic(() => import("./weekday-bar-chart"), {
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

export default function VisitorStatsVisualizations({
  filters,
  filterKey,
}: {
  filters: MTOAnalyticsFilters
  filterKey: string
}) {
  return (
    <div className="space-y-6">
      <div id="visitor-trend">
        <VisitorTrendChart key={`trend-${filterKey}`} filters={filters} />
      </div>

      <div id="weekday-demographics" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div id="weekday">
          <WeekdayBarChart key={`weekday-${filterKey}`} filters={filters} />
        </div>
        <div className="lg:col-span-2">
          <div id="demographics">
            <DemographicsRow key={`demo-${filterKey}`} filters={filters} />
          </div>
        </div>
      </div>

      <div id="top-sites">
        <TopSitesTable key={`sites-${filterKey}`} filters={filters} />
      </div>
    </div>
  )
}
