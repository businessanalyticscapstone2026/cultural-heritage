"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import type { VisitOverview } from "@/features/dashboard/types"

interface VisitsLineChartProps {
  data: VisitOverview[]
  total: number
}

export function VisitsLineChart({ data, total }: VisitsLineChartProps) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-foreground text-2xl font-bold">{total}</span>
        <span className="text-muted-foreground text-sm">This Month</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: string) => {
                const d = new Date(v)
                return `${d.getMonth() + 1}/${d.getDate()}`
              }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 13,
              }}
              labelFormatter={(v) => typeof v === "string" ? new Date(v).toLocaleDateString() : ""}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
