"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
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

const selectData = (data: { visitsOverview: MonthlyVisitsPoint[] }) => data.visitsOverview

export default function VisitsOverviewChart({ municipalityId }: { municipalityId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tourist Visits Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isError && (
          <div className="text-sm text-destructive">
            <p>{error instanceof Error ? error.message : "Failed to load"}</p>
            <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {isPending && <Skeleton className="h-[300px] w-full" />}
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
