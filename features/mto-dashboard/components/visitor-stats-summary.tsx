"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getAllDashboardDataAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Minus, MapPin, TrainFront, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"
import type { VisitorStats } from "@/types/mto-dashboard"

const selectData = (data: { visitorStats: VisitorStats }) => data.visitorStats

const SEGMENTS = [
  { key: "local" as const, label: "Local", icon: MapPin, color: "bg-[#2E5BFF]" },
  { key: "domestic" as const, label: "Domestic", icon: TrainFront, color: "bg-[#8B5CF6]" },
  { key: "international" as const, label: "International", icon: Globe, color: "bg-[#10B981]" },
]

export default function VisitorStatsSummary({ municipalityId }: { municipalityId: string }) {
  const { data: stats, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const total = stats ? stats.local + stats.domestic + stats.international : 0

  const priorTotal = stats?.priorYearTotal ?? 0
  const delta = priorTotal > 0
    ? Math.round(((total - priorTotal) / priorTotal) * 100)
    : total > 0 ? 100 : 0
  const deltaDirection = delta > 0 ? "up" : delta < 0 ? "down" : "stable"

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Visitor Statistics</CardTitle>
          <p className="text-xs text-muted-foreground">Breakdown this year</p>
        </div>
        <Link
          href={ROUTES.MTO.VISITOR_STATS}
          className="text-xs text-primary hover:underline"
        >
          View details
        </Link>
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
              <span className="text-3xl font-bold tracking-tight">{total.toLocaleString()}</span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  deltaDirection === "up" ? "text-success" : deltaDirection === "down" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {deltaDirection === "up" && <TrendingUp className="size-3" />}
                {deltaDirection === "down" && <TrendingDown className="size-3" />}
                {deltaDirection === "stable" && <Minus className="size-3" />}
                <span>
                  {deltaDirection === "up" ? "+" : deltaDirection === "down" ? "-" : ""}{Math.abs(delta)}%
                </span>
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="flex h-full">
                {SEGMENTS.map((segment) => {
                  const count = stats[segment.key]
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  return (
                    <div
                      key={segment.key}
                      className={cn(segment.color, "transition-all", pct === 0 && "hidden")}
                      style={{ width: `${pct}%` }}
                      aria-label={`${segment.label} ${pct}%`}
                    />
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              {SEGMENTS.map((segment) => {
                const count = stats[segment.key]
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                const Icon = segment.icon
                return (
                  <div key={segment.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex size-4 items-center justify-center rounded-sm", segment.color)}>
                        <Icon className="size-2.5 text-white" />
                      </span>
                      <span className="text-sm">{segment.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{count.toLocaleString()}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
