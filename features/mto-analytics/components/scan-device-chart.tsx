"use client"

import { useEffect, useState } from "react"
import { getScanDeviceBreakdownAction } from "../actions/analytics"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { ScanDevicePoint, MTOAnalyticsFilters } from "../types"

export default function ScanDeviceChart({
  filters,
  initialData,
}: {
  filters: MTOAnalyticsFilters
  initialData?: ScanDevicePoint[]
}) {
  const [data, setData] = useState<ScanDevicePoint[] | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (initialData) {
      setData(initialData)
      return
    }
    let cancelled = false
    getScanDeviceBreakdownAction({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      category: filters.categoryId ?? undefined,
    })
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [initialData, filterKey])

  const total = data ? data.reduce((sum, d) => sum + d.count, 0) : 0

  return (
    <ChartCard title="Scans by Device" description="QR scans by device type">
      {error && (
        <div className="text-sm text-destructive">
          <p>{error}</p>
        </div>
      )}
      {!data && !error && <Skeleton className="h-[240px] w-full" />}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No scans in this period</p>
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
