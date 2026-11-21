"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getVisitorTrendAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CHART_PRIMARY } from "@/lib/chart-colors"
import type { VisitorTrendPoint, TrendGranularity, MTOAnalyticsFilters } from "../types"

const GRANULARITIES: { label: string; value: TrendGranularity }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]

export default function VisitorTrendChart({
  filters,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  initialData?: VisitorTrendPoint[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const granularity = (searchParams.get("granularity") as TrendGranularity) ?? "monthly"
  const [data, setData] = useState<VisitorTrendPoint[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)
  const granKey = granularity

  useEffect(() => {
    if (initialData && granularity === "monthly") {
      setData(initialData)
      return
    }
    let cancelled = false
    getVisitorTrendAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, category: filters.categoryId ?? undefined },
      granularity
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, filterKey, granKey])

  const setGranularity = (g: string | null) => {
    if (!g) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("granularity", g)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <ChartCard
      title="Visitor Trend"
      description="Visits over the selected period"
      action={
        <Tabs value={granularity} onValueChange={setGranularity}>
          <TabsList>
            {GRANULARITIES.map((g) => (
              <TabsTrigger key={g.value} value={g.value}>
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
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
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
            <Line
              type="monotone"
              dataKey="visitors"
              stroke={CHART_PRIMARY}
              strokeWidth={2}
              name="Visitors"
              dot={{ fill: CHART_PRIMARY, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
