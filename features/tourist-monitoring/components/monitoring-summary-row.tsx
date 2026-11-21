"use client"

import { useEffect, useState } from "react"
import { getMonitoringSummaryAction } from "../actions/monitoring"
import MonitoringMetricCard from "./monitoring-metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import type {
  MonitoringMetric,
  MonitoringActivityType,
} from "../types"

interface MonitoringSummaryRowProps {
  searchParams: Record<string, string | undefined>
  activeDrillDown: MonitoringActivityType | "all" | null
  onDrillDownToggle: (type: MonitoringActivityType | "all") => void
  initialMetrics?: MonitoringMetric[]
}

export default function MonitoringSummaryRow({
  searchParams,
  activeDrillDown,
  onDrillDownToggle,
  initialMetrics,
}: MonitoringSummaryRowProps) {
  const [metrics, setMetrics] = useState<MonitoringMetric[] | null>(initialMetrics ?? null)
  const [error, setError] = useState<string | null>(null)

  const spKey = JSON.stringify(searchParams)

  useEffect(() => {
    if (initialMetrics) {
      setMetrics(initialMetrics)
      return
    }

    let cancelled = false

    getMonitoringSummaryAction(searchParams)
      .then((result) => {
        if (!cancelled) {
          setMetrics(result.metrics)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load summary"
          )
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMetrics, spKey])

  if (error) {
    return (
      <div className="text-sm text-destructive py-4">{error}</div>
    )
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MonitoringMetricCard
          key={metric.label}
          metric={metric}
          isActive={activeDrillDown === metric.drillDownType}
          onClick={() => onDrillDownToggle(metric.drillDownType)}
        />
      ))}
    </div>
  )
}
