"use client"

import { useEffect, useId, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getVisitorTrendAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import { CHART_AXIS_STROKE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "@/components/charts/chart-theme"
import { cn } from "@/lib/utils"
import type { VisitorTrendPoint, TrendGranularity, AnalyticsFilters } from "../types"

const GRANULARITIES: { label: string; value: TrendGranularity }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]

export default function VisitorTrendChart({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const granularity = (searchParams.get("granularity") as TrendGranularity) ?? "monthly"
  const gradientId = useId().replace(/:/g, "")
  const [data, setData] = useState<VisitorTrendPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)
  const granKey = granularity

  useEffect(() => {
    let cancelled = false
    getVisitorTrendAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined },
      granularity
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, granKey])

  const setGranularity = (g: TrendGranularity) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("granularity", g)
    router.push(`?${params.toString()}`)
  }

  const totalVisitors = data ? data.reduce((sum, d) => sum + d.visitors, 0) : 0
  const average =
    data && data.length > 0 ? Math.round(totalVisitors / data.length) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Visitor Trend</CardTitle>
        <div className="flex gap-1">
          {GRANULARITIES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGranularity(g.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                granularity === g.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive">
            <p>{error}</p>
          </div>
        )}
        {!data && !error && <Skeleton className="h-[300px] w-full" />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No visitor data for this period</p>
        )}
        {data && data.length > 0 && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Total{" "}
                <span className="ml-1 font-semibold text-foreground">
                  {totalVisitors.toLocaleString()}
                </span>
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Avg per period{" "}
                <span className="ml-1 font-semibold text-foreground">
                  {average.toLocaleString()}
                </span>
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                Peak{" "}
                <span className="ml-1 font-semibold text-foreground">
                  {Math.max(...data.map((d) => d.visitors)).toLocaleString()}
                </span>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2E5BFF" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#2E5BFF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={CHART_AXIS_TICK}
                  stroke={CHART_AXIS_STROKE}
                  tickLine={false}
                  minTickGap={32}
                />
                <YAxis
                  tick={CHART_AXIS_TICK}
                  stroke={CHART_AXIS_STROKE}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "hsl(var(--border))" }}
                  content={
                    <ChartTooltip
                      valueFormatter={(value) => `${value.toLocaleString()} visitors`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke="#2E5BFF"
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  activeDot={{ r: 4, fill: "#2E5BFF" }}
                  isAnimationActive
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
