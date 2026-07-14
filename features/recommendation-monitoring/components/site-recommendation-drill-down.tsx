"use client"

import { useEffect, useState } from "react"
import { getSiteRecommendationDetailAction } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"
import type { SiteRecommendationDetail, RecommendationMonitoringFilters } from "../types"
import { RECOMMENDATION_SOURCE_LABELS } from "../utils"

interface SiteRecommendationDrillDownProps {
  siteId: string
  filters: RecommendationMonitoringFilters
  onClose?: () => void
}

export default function SiteRecommendationDrillDown({
  siteId,
  filters,
  onClose,
}: SiteRecommendationDrillDownProps) {
  const [data, setData] = useState<SiteRecommendationDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getSiteRecommendationDetailAction(siteId, filters)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load") })
    return () => { cancelled = true }
  }, [filterKey])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Detail</CardTitle>
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
          <CardTitle className="text-base">Site Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{data.siteName}</CardTitle>
          <p className="text-xs text-muted-foreground">{data.categoryName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricBox label="Generated" value={data.totalGenerated} />
          <MetricBox label="Clicked" value={data.totalClicked} />
          <MetricBox label="Bookmarked" value={data.totalBookmarked} />
          <MetricBox label="Converted" value={data.totalConverted} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {data.clickThroughRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Click-Through Rate</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {data.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </div>
        </div>

        {data.sourceBreakdown.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Source Breakdown</h4>
            <div className="space-y-2">
              {data.sourceBreakdown.map((src) => (
                <div key={src.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {RECOMMENDATION_SOURCE_LABELS[src.source] ?? src.source}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{src.count.toLocaleString()}</span>
                    <span className="text-xs">({src.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.dailyTrend.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-medium">
              <BarChart3 className="size-4" />
              Daily Trend
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-1 pr-3 text-left">Date</th>
                    <th className="pb-1 pr-3 text-right">Generated</th>
                    <th className="pb-1 pr-3 text-right">Clicked</th>
                    <th className="pb-1 text-right">Converted</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyTrend.map((day) => (
                    <tr key={day.date} className="border-b last:border-0">
                      <td className="py-1.5 pr-3">{day.date}</td>
                      <td className="py-1.5 pr-3 text-right">{day.generated}</td>
                      <td className="py-1.5 pr-3 text-right">{day.clicked}</td>
                      <td className="py-1.5 text-right">{day.converted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-2 text-center">
      <p className="text-lg font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
