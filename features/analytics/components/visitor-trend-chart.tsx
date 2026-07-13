"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getVisitorTrendAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
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
                stroke="#2E5BFF"
                strokeWidth={2}
                name="Visitors"
                dot={{ fill: "#2E5BFF", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
