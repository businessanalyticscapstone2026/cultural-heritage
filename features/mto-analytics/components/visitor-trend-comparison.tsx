"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getVisitorTrendComparisonAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CHART_PRIMARY, CHART_COMPARISON } from "@/lib/chart-colors"
import type { ComparisonPoint, TrendGranularity, MTOAnalyticsFilters } from "../types"

export default function VisitorTrendComparison({
  filters,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  initialData?: ComparisonPoint[]
}) {
  const searchParams = useSearchParams()
  const granularity = (searchParams.get("granularity") as TrendGranularity) ?? "monthly"
  const [data, setData] = useState<ComparisonPoint[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)
  const granKey = granularity

  useEffect(() => {
    if (initialData && granularity === "monthly") {
      setData(initialData)
      return
    }
    let cancelled = false
    getVisitorTrendComparisonAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, category: filters.categoryId ?? undefined },
      granularity
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, filterKey, granKey])

  return (
    <ChartCard title="Current vs Prior Period" description="Selected window vs the preceding one">
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
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="monotone"
              dataKey="current"
              name="Current Period"
              stroke={CHART_PRIMARY}
              strokeWidth={2}
              dot={{ fill: CHART_PRIMARY, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="prior"
              name="Prior Period"
              stroke={CHART_COMPARISON}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: CHART_COMPARISON, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
