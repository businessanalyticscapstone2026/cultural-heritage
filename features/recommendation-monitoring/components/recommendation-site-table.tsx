"use client"

import { useEffect, useState } from "react"
import { getRecommendationSiteSummariesAction } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { RecommendationSiteSummary, RecommendationMonitoringFilters } from "../types"

interface RecommendationSiteTableProps {
  filters: RecommendationMonitoringFilters
  onSiteClick?: (siteId: string) => void
}

export default function RecommendationSiteTable({
  filters,
  onSiteClick,
}: RecommendationSiteTableProps) {
  const [data, setData] = useState<RecommendationSiteSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getRecommendationSiteSummariesAction(filters)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load") })
    return () => { cancelled = true }
  }, [filterKey])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Performance</CardTitle>
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
          <CardTitle className="text-base">Site Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recommendation data available for the selected period.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Site Performance</CardTitle>
        <Badge variant="secondary">{data.length} sites</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-3 text-left">Site</th>
                <th className="pb-2 pr-3 text-left">Category</th>
                <th className="pb-2 pr-3 text-right">Recommended</th>
                <th className="pb-2 pr-3 text-right">Clicked</th>
                <th className="pb-2 pr-3 text-right">Bookmarked</th>
                <th className="pb-2 pr-3 text-right">Converted</th>
                <th className="pb-2 pr-3 text-right">CTR</th>
                <th className="pb-2 text-right">Conv Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.siteId}
                  className={`border-b last:border-0 ${
                    onSiteClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }`}
                  onClick={() => onSiteClick?.(row.siteId)}
                >
                  <td className="py-2.5 pr-3 font-medium">{row.siteName}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {row.categoryName}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.timesRecommended.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.timesClicked.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.timesBookmarked.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.timesConverted.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-right">
                    {row.clickThroughRate.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right">
                    {row.conversionRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
