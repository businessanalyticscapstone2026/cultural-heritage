"use client"

import { useEffect, useState } from "react"
import { getDemographicsAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { CHART_PALETTE } from "@/lib/chart-colors"
import type { AgeGroupBreakdown, VisitorTypeBreakdown, MTOAnalyticsFilters } from "../types"

export default function DemographicsRow({
  filters,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  initialData?: {
    ageGroups: AgeGroupBreakdown[]
    visitorTypes: VisitorTypeBreakdown[]
  }
}) {
  const [ageData, setAgeData] = useState<AgeGroupBreakdown[] | null>(initialData?.ageGroups ?? null)
  const [typeData, setTypeData] = useState<VisitorTypeBreakdown[] | null>(initialData?.visitorTypes ?? null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (initialData) {
      setAgeData(initialData.ageGroups)
      setTypeData(initialData.visitorTypes)
      return
    }
    let cancelled = false
    getDemographicsAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, category: filters.categoryId ?? undefined }
    )
      .then((d) => {
        if (!cancelled) {
          setAgeData(d.ageGroups)
          setTypeData(d.visitorTypes)
        }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, filterKey])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ChartCard title="Visitors by Age Group">
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!ageData && !error && <Skeleton className="h-[250px] w-full" />}
        {ageData && ageData.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No demographic data</p>
        )}
        {ageData && ageData.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ageData} dataKey="count" nameKey="ageGroup" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                {ageData.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Visitors by Type">
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!typeData && !error && <Skeleton className="h-[250px] w-full" />}
        {typeData && typeData.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No demographic data</p>
        )}
        {typeData && typeData.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                {typeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  )
}
