"use client"

import { useEffect, useState } from "react"
import { getUnderPromotedRecommendationsAction } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle } from "lucide-react"
import type { UnderPromotedSite, RecommendationMonitoringFilters } from "../types"

interface UnderPromotedPanelProps {
  filters: RecommendationMonitoringFilters
}

export default function UnderPromotedPanel({
  filters,
}: UnderPromotedPanelProps) {
  const [data, setData] = useState<UnderPromotedSite[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getUnderPromotedRecommendationsAction(filters)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load") })
    return () => { cancelled = true }
  }, [filterKey])

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base">Under-Promoted Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base">Under-Promoted Sites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800/20 dark:bg-amber-950/10">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-500" />
        <CardTitle className="text-base font-semibold">
          Under-Promoted Sites ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          These heritage sites have the lowest recommendation volume and may need more visibility.
        </p>
        <ul className="space-y-3">
          {data.map((site) => (
            <li
              key={site.siteId}
              className="rounded-md border border-amber-200/50 bg-white/50 p-3 dark:border-amber-800/10 dark:bg-amber-950/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{site.siteName}</p>
                  <p className="text-xs text-muted-foreground">
                    {site.categoryName}
                  </p>
                </div>
                <span className="text-xs font-medium text-amber-700 dark:text-amber-500">
                  #{site.percentileRank}th percentile
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {site.timesRecommended.toLocaleString()} recs
                </span>
                <span>
                  {site.clickThroughRate.toFixed(1)}% CTR
                </span>
              </div>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-500/80">
                {site.flagReason}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
