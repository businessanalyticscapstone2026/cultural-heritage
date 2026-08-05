"use client"

import { useEffect, useState } from "react"
import { getRecommendationPerformanceAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import { CHART_PALETTE } from "@/lib/chart-colors"
import type { RecommendationFunnel, MTOAnalyticsFilters } from "../types"

export default function RecommendationFunnel({
  filters,
}: {
  filters: MTOAnalyticsFilters
}) {
  const [data, setData] = useState<RecommendationFunnel | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getRecommendationPerformanceAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey])

  const stages = data
    ? [
        { label: "Generated", value: data.generated, color: CHART_PALETTE[0] },
        { label: "Clicked", value: data.clicked, color: CHART_PALETTE[5] },
        { label: "Route Plans", value: data.routePlans, color: CHART_PALETTE[2] },
        { label: "Conversions", value: data.conversions, color: CHART_PALETTE[3] },
      ]
    : []

  const maxValue = stages.length > 0 ? stages[0].value : 1

  return (
    <ChartCard title="Recommendation Performance" description="Generated → clicked → planned → converted">
      {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
      {!data && !error && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}
      {data && (
        <div className="space-y-3">
          {stages.map((stage, i) => {
            const widthPct = maxValue > 0 ? Math.max((stage.value / maxValue) * 100, 8) : 8
            const convRate = i > 0 && stages[i - 1].value > 0
              ? Math.round((stage.value / stages[i - 1].value) * 100)
              : 100
            return (
              <div key={stage.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{stage.value.toLocaleString()}</span>
                    {i > 0 && (
                      <span className="text-xs text-muted-foreground">({convRate}% of prev)</span>
                    )}
                  </div>
                </div>
                <div className="h-6 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                  />
                </div>
                {i < stages.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowRight className="size-3 text-muted-foreground/70 rotate-90" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </ChartCard>
  )
}
