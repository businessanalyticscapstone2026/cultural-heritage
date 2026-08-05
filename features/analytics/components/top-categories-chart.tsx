"use client"

import { useEffect, useState } from "react"
import { getTopCategoriesAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import { CHART_AXIS_STROKE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "@/components/charts/chart-theme"
import type { CategoryVisit, AnalyticsFilters } from "../types"

export default function TopCategoriesChart({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const [data, setData] = useState<CategoryVisit[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getTopCategoriesAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, filters])

  const total = data ? data.reduce((sum, d) => sum + d.visits, 0) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Heritage Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!data && !error && <Skeleton className="h-[300px] w-full" />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No category data</p>
        )}
        {data && data.length > 0 && (
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
            <BarChart data={data} layout="vertical" margin={{ left: 12, right: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={CHART_AXIS_TICK} stroke={CHART_AXIS_STROKE} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="categoryName" tick={CHART_AXIS_TICK} stroke={CHART_AXIS_STROKE} width={90} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                content={
                  <ChartTooltip
                    labelFormatter={(label) => String(label)}
                    valueFormatter={(value) => {
                      const pct = total > 0 ? Math.round((value / total) * 100) : 0
                      return `${value.toLocaleString()} visits (${pct}%)`
                    }}
                  />
                }
              />
              <Bar dataKey="visits" name="Visits" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={700}>
                {data.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="visits"
                  position="right"
                  formatter={(value: unknown) => Number(value).toLocaleString()}
                  className="fill-foreground text-xs font-medium"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
