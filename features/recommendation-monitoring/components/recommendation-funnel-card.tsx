"use client"

import { useEffect, useState } from "react"
import { getRecommendationFunnelAction } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import type { RecommendationFunnelMetrics } from "../types"
import type { RecommendationMonitoringFilters } from "../types"

interface RecommendationFunnelCardProps {
  filters: RecommendationMonitoringFilters
}

const FUNNEL_STAGES = [
  { key: "generated" as const, label: "Generated", color: "#2E5BFF" },
  { key: "clicked" as const, label: "Clicked", color: "#8B5CF6" },
  { key: "bookmarked" as const, label: "Bookmarked", color: "#F59E0B" },
  { key: "routePlans" as const, label: "Route Plans", color: "#10B981" },
]

export default function RecommendationFunnelCard({
  filters,
}: RecommendationFunnelCardProps) {
  const [data, setData] = useState<RecommendationFunnelMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getRecommendationFunnelAction(filters)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load") })
    return () => { cancelled = true }
  }, [filterKey])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendation Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommendation Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const maxValue = data.generated || 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recommendation Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {FUNNEL_STAGES.map((stage, i) => {
          const value = data[stage.key]
          const widthPct = Math.max((value / maxValue) * 100, 8)
          const prevValue = i > 0 ? data[FUNNEL_STAGES[i - 1].key] : null
          const stageRate =
            prevValue !== null && prevValue > 0
              ? Math.round((value / prevValue) * 100)
              : 100

          return (
            <div key={stage.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{value.toLocaleString()}</span>
                  {i > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({stageRate}% of prev)
                    </span>
                  )}
                </div>
              </div>
              <div className="h-6 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
              {i < FUNNEL_STAGES.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowRight className="size-3 text-muted-foreground/50 rotate-90" />
                </div>
              )}
            </div>
          )
        })}

        <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {data.clickThroughRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Click-Through Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {data.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
