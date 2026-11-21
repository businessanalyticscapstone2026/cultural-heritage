"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { MTOAnalyticsFilters, MTOAnalyticsBundle } from "../types"

const ChartSkeleton = () => <Skeleton className="h-[300px] w-full rounded-xl" />

const VisitorTrendChart = dynamic(() => import("./visitor-trend-chart"), {
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

export default function VisitorStatsVisualizations({
  filters,
  filterKey,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  filterKey?: string
  initialData?: MTOAnalyticsBundle
}) {
  return (
    <div className="space-y-8">
      {/* Volume & Growth Trajectory */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Visitor Volume &amp; Trajectory
        </h2>
        <div id="visitor-trend">
          <VisitorTrendChart filters={filters} initialData={initialData?.visitorTrend} />
        </div>
      </section>

      {/* Demographics & Origin Distribution */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Audience Composition &amp; Scanning Technology
        </h2>
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
      </section>

      {/* Temporal Distribution & Attraction Breakdown */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Day-of-Week Patterns &amp; Attraction Popularity
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div id="weekday">
            <WeekdayBarChart filters={filters} initialData={initialData?.weekdayVisits} />
          </div>
          <div id="visits-by-attraction">
            <VisitsByAttractionPanel filters={filters} initialData={initialData?.visitsByAttraction} />
          </div>
        </div>
      </section>

      {/* Site-Level Foot Traffic Rankings */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Site Foot Traffic Rankings
        </h2>
        <div id="top-sites">
          <TopSitesTable filters={filters} initialData={initialData?.topSites} />
        </div>
      </section>
    </div>
  )
}
