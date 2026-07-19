"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus, MapPin, Globe } from "lucide-react"
import type { VisitorStats } from "@/types/mto-dashboard"

const selectData = (data: { visitorStats: VisitorStats }) => data.visitorStats

export default function VisitorStatsSummary({ municipalityId }: { municipalityId: string }) {
  const { data: stats, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  const total = stats ? stats.local + stats.domestic + stats.international : 0
  const foreign = stats ? stats.domestic + stats.international : 0
  const localPct = total > 0 ? Math.round((stats!.local / total) * 100) : 0
  const foreignPct = 100 - localPct

  const priorTotal = stats?.priorYearTotal ?? 0
  const delta = priorTotal > 0
    ? Math.round(((total - priorTotal) / priorTotal) * 100)
    : total > 0 ? 100 : 0
  const deltaDirection = delta > 0 ? "up" : delta < 0 ? "down" : "stable"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visitor Statistics (This Year)</CardTitle>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="text-sm text-destructive">
            <p>{error instanceof Error ? error.message : "Failed to load"}</p>
            <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {isPending && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        {stats && (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{total.toLocaleString()}</span>
              <span className="flex items-center gap-0.5 text-xs">
                {deltaDirection === "up" && <TrendingUp className="size-3 text-green-600" />}
                {deltaDirection === "down" && <TrendingDown className="size-3 text-red-600" />}
                {deltaDirection === "stable" && <Minus className="size-3 text-muted-foreground" />}
                <span className={deltaDirection === "up" ? "text-green-600" : deltaDirection === "down" ? "text-red-600" : "text-muted-foreground"}>
                  {deltaDirection === "up" ? "+" : deltaDirection === "down" ? "-" : ""}{Math.abs(delta)}%
                </span>
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="flex h-full">
                <div
                  className="bg-blue-500 transition-all"
                  style={{ width: `${localPct}%` }}
                />
                <div
                  className="bg-purple-500 transition-all"
                  style={{ width: `${foreignPct}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-blue-600" />
                  <span className="text-sm">Local Visitors</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{stats.local.toLocaleString()}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{localPct}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="size-3.5 text-purple-600" />
                  <span className="text-sm">Foreign Visitors</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">{foreign.toLocaleString()}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{foreignPct}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
