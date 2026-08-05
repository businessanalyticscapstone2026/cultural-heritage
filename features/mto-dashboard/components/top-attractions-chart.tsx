"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { CHART_PRIMARY } from "@/lib/chart-colors"
import type { TopAttraction } from "@/types/mto-dashboard"

const selectData = (data: { topAttractions: TopAttraction[] }) => data.topAttractions

export default function TopAttractionsChart({ municipalityId }: { municipalityId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  return (
    <ChartCard
      title="Top Attractions"
      description="Most-visited sites this month"
    >
      {isError && (
        <div className="text-sm text-destructive">
          <p>{error instanceof Error ? error.message : "Failed to load"}</p>
          <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      )}
      {isPending && <Skeleton className="h-[280px] w-full" />}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No visits recorded this month</p>
      )}
      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="siteName"
              width={96}
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="visits" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
