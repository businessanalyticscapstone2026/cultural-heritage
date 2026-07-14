"use client"

import { useEffect, useState } from "react"
import { getVisitsOverviewAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { MonthlyVisitsPoint } from "@/types/mto-dashboard"

export default function VisitsOverviewChart() {
  const [data, setData] = useState<MonthlyVisitsPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setData(null)
    getVisitsOverviewAction()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  }

  useEffect(() => {
    let cancelled = false
    getVisitsOverviewAction()
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
      <CardHeader>
        <CardTitle className="text-base">Tourist Visits Overview</CardTitle>
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
        {data && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="currentYear"
                stroke="#2E5BFF"
                strokeWidth={2}
                name="This Year"
                dot={{ fill: "#2E5BFF", r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="priorYear"
                stroke="#94a3b8"
                strokeWidth={2}
                name="Last Year"
                strokeDasharray="5 5"
                dot={{ fill: "#94a3b8", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
