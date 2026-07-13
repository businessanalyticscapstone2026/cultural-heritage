"use client"

import { useEffect, useState } from "react"
import { getRecommendationPerformanceAction } from "../actions/monitoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import type { RecommendationPerf } from "../types"

interface RecommendationMonitoringPanelProps {
  searchParams: Record<string, string | undefined>
}

export default function RecommendationMonitoringPanel({
  searchParams,
}: RecommendationMonitoringPanelProps) {
  const [data, setData] = useState<RecommendationPerf[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const spKey = JSON.stringify(searchParams)

  useEffect(() => {
    let cancelled = false

    getRecommendationPerformanceAction(searchParams)
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed")
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey])

  const totalRecommended =
    data?.reduce((sum, r) => sum + r.timesRecommended, 0) ?? 0
  const totalClicked =
    data?.reduce((sum, r) => sum + r.timesClicked, 0) ?? 0
  const totalConverted =
    data?.reduce((sum, r) => sum + r.timesConverted, 0) ?? 0

  const stages = [
    { label: "Generated", value: totalRecommended, color: "#2E5BFF" },
    { label: "Clicked", value: totalClicked, color: "#8B5CF6" },
    { label: "Converted", value: totalConverted, color: "#10B981" },
  ]

  const maxValue = stages[0].value

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Recommendation Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive">
            <p>{error}</p>
          </div>
        )}

        {!data && !error && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
            <Skeleton className="h-48 w-full mt-4" />
          </div>
        )}

        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No recommendation data
          </p>
        )}

        {data && data.length > 0 && (
          <>
            <div className="space-y-3">
              {stages.map((stage, i) => {
                const widthPct =
                  maxValue > 0
                    ? Math.max((stage.value / maxValue) * 100, 8)
                    : 8
                const convRate =
                  i > 0 && stages[i - 1].value > 0
                    ? Math.round((stage.value / stages[i - 1].value) * 100)
                    : 100
                return (
                  <div key={stage.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {stage.value.toLocaleString()}
                        </span>
                        {i > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({convRate}% of prev)
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
                    {i < stages.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowRight className="size-3 text-muted-foreground/50 rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-3 text-left">Site</th>
                    <th className="pb-2 pr-3 text-right">Recommended</th>
                    <th className="pb-2 pr-3 text-right">Clicks</th>
                    <th className="pb-2 pr-3 text-right">Conversions</th>
                    <th className="pb-2 pr-3 text-right">Click Rate</th>
                    <th className="pb-2 text-right">Conv Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data]
                    .sort((a, b) => b.convRate - a.convRate)
                    .slice(0, 10)
                    .map((row) => (
                      <tr
                        key={row.siteId}
                        className="border-b last:border-0"
                      >
                        <td className="py-2.5 pr-3 font-medium">
                          {row.siteName}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {row.timesRecommended.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {row.timesClicked.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {row.timesConverted.toLocaleString()}
                        </td>
                        <td className="py-2.5 pr-3 text-right">
                          {(row.clickRate * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 text-right">
                          {(row.convRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
