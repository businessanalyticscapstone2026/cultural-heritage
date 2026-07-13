"use client"

import { useEffect, useState } from "react"
import { getTopSitesAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"
import type { TopVisitedSite, AnalyticsFilters } from "../types"

export default function TopSitesTable({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const [sites, setSites] = useState<TopVisitedSite[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getTopSitesAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setSites(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, filters])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Visited Heritage Sites</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!sites && !error && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}
        {sites && sites.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No visit data</p>
        )}
        {sites && sites.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 pr-3 text-left font-medium text-muted-foreground">#</th>
                  <th className="pb-2 pr-3 text-left font-medium text-muted-foreground">Site</th>
                  <th className="hidden pb-2 pr-3 text-left font-medium text-muted-foreground md:table-cell">Municipality</th>
                  <th className="hidden pb-2 pr-3 text-left font-medium text-muted-foreground md:table-cell">Category</th>
                  <th className="pb-2 pr-3 text-right font-medium text-muted-foreground">Visits</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site, i) => (
                  <tr key={site.siteId} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      {i < 3 ? (
                        <Trophy className={`size-4 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-amber-600"}`} />
                      ) : (
                        <span className="text-xs text-muted-foreground">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 font-medium">{site.siteName}</td>
                    <td className="hidden py-2.5 pr-3 text-muted-foreground md:table-cell">{site.municipalityName}</td>
                    <td className="hidden py-2.5 pr-3 md:table-cell">
                      <Badge variant="secondary" className="text-[10px]">{site.categoryName}</Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-right font-medium">{site.visits.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{site.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
