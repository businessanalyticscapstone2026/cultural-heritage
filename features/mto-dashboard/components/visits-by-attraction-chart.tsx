"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getVisitsByCategoryAction } from "../actions/dashboard"
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
import type { CategoryBreakdownPoint } from "@/types/mto-dashboard"

export default function VisitsByAttractionChart() {
  const [data, setData] = useState<CategoryBreakdownPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setData(null)
    getVisitsByCategoryAction()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  }

  useEffect(() => {
    let cancelled = false
    getVisitsByCategoryAction()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      })
    return () => { cancelled = true }
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Visits by Attraction</CardTitle>
        <Link href="/mto/visitor-stats" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {!data && !error && <Skeleton className="h-[300px] w-full" />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No visit data yet</p>
        )}
        {data && data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-lg font-bold">
                {data.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
              </text>
              <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[11px]">
                Total Visits
              </text>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
