"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getAllDashboardDataAction } from "../actions/dashboard"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { CHART_PRIMARY, CHART_COMPARISON } from "@/lib/chart-colors"
import { ROUTES } from "@/lib/constants"
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
    <ChartCard
      title="Sites Clicked Overview"
      description="This year vs last year"
      action={
        <Link href={ROUTES.MTO.ANALYTICS} className="text-xs text-primary hover:underline">
          View details
        </Link>
      }
    >
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
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="visits-current" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area
              type="monotone"
              dataKey="currentYear"
              name="This Year"
              stroke={CHART_PRIMARY}
              strokeWidth={2}
              fill="url(#visits-current)"
              dot={{ fill: CHART_PRIMARY, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="priorYear"
              name="Last Year"
              stroke={CHART_COMPARISON}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: CHART_COMPARISON, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
