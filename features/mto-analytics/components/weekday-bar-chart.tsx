"use client"

import { useEffect, useState } from "react"
import { getVisitsByWeekdayAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { CHART_PALETTE, CHART_PRIMARY } from "@/lib/chart-colors"
import type { WeekdayVisits, MTOAnalyticsFilters } from "../types"

export default function WeekdayBarChart({
  filters,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  initialData?: WeekdayVisits[]
}) {
  const [data, setData] = useState<WeekdayVisits[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      return
    }
    let cancelled = false
    getVisitsByWeekdayAction({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      category: filters.categoryId ?? undefined,
    })
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, filterKey])

  const maxDay = data && data.length > 0
    ? data.reduce((max, d) => (d.visits > max.visits ? d : max), data[0])
    : null

  return (
    <ChartCard title="Visits by Day of Week" description="Busiest weekdays">
      {error && (
        <div className="text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}
      {!data && !error && <Skeleton className="h-[280px] w-full" />}
      {data && data.every((d) => d.visits === 0) && (
        <p className="py-8 text-center text-sm text-muted-foreground">No visit data for this period</p>
      )}
      {data && data.some((d) => d.visits > 0) && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="visits" radius={[4, 4, 0, 0]} barSize={26}>
              {data.map((d) => (
                <Cell
                  key={d.day}
                  fill={maxDay && d.day === maxDay.day ? CHART_PRIMARY : CHART_PALETTE[1]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
