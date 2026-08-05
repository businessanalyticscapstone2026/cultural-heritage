"use client"

import { useEffect, useState } from "react"
import { getDemographicsAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import type { AgeGroupBreakdown, VisitorTypeBreakdown, AnalyticsFilters } from "../types"

const AGE_COLORS = ["#2E5BFF", "#0F2747", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"]

function DonutWithLegend({
  data,
  colors,
}: {
  data: Array<{ label: string; count: number; color?: string }>
  colors: string[]
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <div className="relative mx-auto h-52 max-w-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.label}
                  fill={entry.color ?? colors[i % colors.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => String(label)}
                  valueFormatter={(value) => `${value.toLocaleString()} visitors`}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{total.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">Visitors</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
        {data.map((entry, i) => (
          <span key={entry.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? colors[i % colors.length] }}
            />
            {entry.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DemographicsRow({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const [ageData, setAgeData] = useState<AgeGroupBreakdown[] | null>(null)
  const [typeData, setTypeData] = useState<VisitorTypeBreakdown[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getDemographicsAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined }
    )
      .then((d) => {
        if (!cancelled) {
          setAgeData(d.ageGroups)
          setTypeData(d.visitorTypes)
        }
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, filters])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitors by Age Group</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
          {!ageData && !error && <Skeleton className="h-[250px] w-full" />}
          {ageData && ageData.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No demographic data</p>
          )}
          {ageData && ageData.length > 0 && (
            <DonutWithLegend
              data={ageData.map((a) => ({ label: a.ageGroup, count: a.count }))}
              colors={AGE_COLORS}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visitors by Type</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
          {!typeData && !error && <Skeleton className="h-[250px] w-full" />}
          {typeData && typeData.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No demographic data</p>
          )}
          {typeData && typeData.length > 0 && (
            <DonutWithLegend
              data={typeData.map((t) => ({ label: t.type, count: t.count, color: t.color }))}
              colors={AGE_COLORS}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
