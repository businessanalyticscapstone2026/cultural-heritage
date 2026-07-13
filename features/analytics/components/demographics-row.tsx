"use client"

import { useEffect, useState } from "react"
import { getDemographicsAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { AgeGroupBreakdown, VisitorTypeBreakdown, AnalyticsFilters } from "../types"

const AGE_COLORS = ["#2E5BFF", "#0F2747", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"]

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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={ageData} dataKey="count" nameKey="ageGroup" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
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
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
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
        </CardContent>
      </Card>
    </div>
  )
}
