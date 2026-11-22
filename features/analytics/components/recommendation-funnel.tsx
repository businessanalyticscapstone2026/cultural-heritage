"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { getRecommendationPerformanceAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import type { RecommendationFunnel, AnalyticsFilters } from "../types"

const STAGE_THEME = [
  { color: "#2E5BFF", gradient: "linear-gradient(90deg, #2E5BFF, #5B7BFF)" },
  { color: "#8B5CF6", gradient: "linear-gradient(90deg, #8B5CF6, #A78BFA)" },
  { color: "#F59E0B", gradient: "linear-gradient(90deg, #F59E0B, #FBBF24)" },
  { color: "#10B981", gradient: "linear-gradient(90deg, #10B981, #34D399)" },
]

export default function RecommendationFunnel({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const prefersReducedMotion = useReducedMotion()
  const [data, setData] = useState<RecommendationFunnel | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getRecommendationPerformanceAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, filters])

  const stages = data
    ? [
        { label: "Generated", value: data.generated },
        { label: "Clicked", value: data.clicked },
        { label: "Route Plans", value: data.routePlans },
        { label: "Conversions", value: data.conversions },
      ].map((stage, i) => ({ ...stage, ...STAGE_THEME[i] }))
    : []

  const maxValue = stages.length > 0 ? stages[0].value : 1

  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recommendation Performance</CardTitle>
        {data && data.generated > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {Math.round((data.conversions / data.generated) * 100)}% conversion
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between pt-2">
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!data && !error && (
          <div className="space-y-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}
        {data && (
          <div className="flex flex-1 flex-col justify-around py-1 space-y-2">
            {stages.map((stage, i) => {
              const widthPct = maxValue > 0 ? Math.max((stage.value / maxValue) * 100, 8) : 8
              const convRate = i > 0 && stages[i - 1].value > 0
                ? Math.round((stage.value / stages[i - 1].value) * 100)
                : null
              return (
                <div key={stage.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">{stage.value.toLocaleString()}</span>
                      {convRate != null && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
                          style={{
                            color: stage.color,
                            backgroundColor: `${stage.color}1a`,
                          }}
                        >
                          <ArrowRight className="size-3" />
                          {convRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded bg-muted">
                    <motion.div
                      className="h-full rounded"
                      style={{ backgroundImage: stage.gradient }}
                      initial={prefersReducedMotion ? undefined : { width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 }}
                    />
                  </div>
                  {i < stages.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className="size-3 text-muted-foreground/40 rotate-90" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
