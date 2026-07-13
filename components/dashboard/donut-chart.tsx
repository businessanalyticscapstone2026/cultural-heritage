"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { CategoryBreakdown } from "@/features/dashboard/types"

interface DonutChartProps {
  data: CategoryBreakdown[]
  total: number
}

export function DonutChart({ data, total }: DonutChartProps) {
  const filtered = data.filter((d) => d.count > 0)

  return (
    <div className="relative flex h-64 items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="count"
            strokeWidth={0}
          >
            {filtered.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-foreground text-2xl font-bold">{total}</span>
        <span className="text-muted-foreground text-xs">Total</span>
      </div>
    </div>
  )
}
