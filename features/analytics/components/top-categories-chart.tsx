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
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
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
          <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
            <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="categoryName" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="visits" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
