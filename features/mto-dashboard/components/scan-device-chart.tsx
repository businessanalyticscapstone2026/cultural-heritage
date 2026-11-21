"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { ScanDeviceBreakdownPoint } from "@/types/mto-dashboard"

const selectData = (data: { scanDeviceBreakdown: ScanDeviceBreakdownPoint[] }) => data.scanDeviceBreakdown

export default function ScanDeviceChart({ municipalityId }: { municipalityId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 0,
    refetchInterval: 30_000,
  })

  const total = data ? data.reduce((sum, d) => sum + d.count, 0) : 0

  return (
    <ChartCard title="Scans by Device" description="This month">
      {isError && (
        <div className="text-sm text-destructive">
          <p>{error instanceof Error ? error.message : "Failed to load"}</p>
          <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      )}
      {isPending && <Skeleton className="h-[240px] w-full" />}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No scans this month</p>
      )}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
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
                  Scans
                </text>
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toLocaleString(), "Scans"]}
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
          <div className="w-full space-y-2 sm:w-1/2">
            {data.map((entry) => {
              const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
              return (
                <div key={entry.device} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.count.toLocaleString()}</span>
                    <span className="w-9 text-right text-xs text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
