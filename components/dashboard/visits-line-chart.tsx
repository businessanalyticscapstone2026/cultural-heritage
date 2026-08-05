"use client"

import { useId } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import { CHART_AXIS_STROKE, CHART_AXIS_TICK, CHART_GRID_STROKE } from "@/components/charts/chart-theme"
import type { VisitOverview } from "@/features/dashboard/types"

interface VisitsLineChartProps {
  data: VisitOverview[]
  total: number
}

export function VisitsLineChart({ data, total }: VisitsLineChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const average = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.count, 0) / data.length) : 0

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-sm text-muted-foreground">This Month</span>
      </div>

      {data.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Peak{" "}
            <span className="ml-1 font-semibold text-foreground">
              {Math.max(...data.map((d) => d.count)).toLocaleString()}
            </span>
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Daily avg{" "}
            <span className="ml-1 font-semibold text-foreground">
              {average.toLocaleString()}
            </span>
          </span>
        </div>
      )}

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e5bff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2e5bff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="date"
              tick={CHART_AXIS_TICK}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
              stroke={CHART_AXIS_STROKE}
              minTickGap={24}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={CHART_AXIS_TICK}
              stroke={CHART_AXIS_STROKE}
              width={36}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              content={
                <ChartTooltip
                  labelFormatter={(label) =>
                    typeof label === "string" ? new Date(label).toLocaleDateString() : String(label)
                  }
                  valueFormatter={(value) => `${value.toLocaleString()} visits`}
                />
              }
            />
            <ReferenceLine
              y={average}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Visits"
              stroke="#2e5bff"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: "#2e5bff" }}
              isAnimationActive
              animationDuration={700}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
