"use client"

import { useEffect, useState } from "react"
import { getSummaryMetricsAction } from "../actions/analytics"
import SummaryMetricCard from "./summary-metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { MTOMetric } from "../types"

export default function SummaryMetricsRow({
  searchParams,
  initialData,
}: {
  searchParams: Record<string, string | undefined>
  initialData?: MTOMetric[]
}) {
  const [metrics, setMetrics] = useState<MTOMetric[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setMetrics(initialData)
      return
    }
    let cancelled = false
    getSummaryMetricsAction(searchParams)
      .then((data) => { if (!cancelled) setMetrics(data) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, searchParams])

  if (error) {
    return (
      <div className="rounded-md border p-4 text-sm text-destructive">
        <p>{error}</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <SummaryMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  )
}
