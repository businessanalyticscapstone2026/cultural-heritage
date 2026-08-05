"use client"

import { useEffect, useState } from "react"
import { getVisitsByAttractionAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { AttractionVisit, MTOAnalyticsFilters } from "../types"

export default function VisitsByAttractionPanel({
  filters,
}: {
  filters: MTOAnalyticsFilters
}) {
  const [data, setData] = useState<AttractionVisit[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getVisitsByAttractionAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey])

  const total = data ? data.reduce((sum, d) => sum + d.visits, 0) : 0

  return (
    <ChartCard title="Visitors by Attraction" description="Share of visits by category">
      {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
      {!data && !error && <Skeleton className="h-[300px] w-full" />}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No visit data</p>
      )}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="visits"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-base font-bold">
                  {total.toLocaleString()}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
                  Total Visits
                </text>
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full space-y-1.5 md:w-1/2">
            {data.map((attraction) => (
              <div key={attraction.categoryName} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: attraction.color }} />
                  <span>{attraction.categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{attraction.visits.toLocaleString()}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground">{attraction.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
