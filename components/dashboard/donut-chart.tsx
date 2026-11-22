"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import { cn } from "@/lib/utils"
import { formatCategoryName } from "@/lib/format-category"
import type { CategoryBreakdown } from "@/features/dashboard/types"

interface DonutChartProps {
  data: CategoryBreakdown[]
  total: number
}

export function DonutChart({ data, total }: DonutChartProps) {
  const prefersReducedMotion = useReducedMotion()
  const filtered = data.filter((d) => d.count > 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col justify-between">
      <div className="relative flex h-52 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="count"
              nameKey="name"
              strokeWidth={0}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {filtered.map((entry, index) => (
                <Cell
                  key={entry.id}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="cursor-pointer transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => formatCategoryName(String(label))}
                  valueFormatter={(value) => `${value.toLocaleString()} site${value === 1 ? "" : "s"}`}
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      {filtered.length > 0 && (
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {filtered.map((entry, index) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
            return (
              <li key={entry.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {formatCategoryName(entry.name)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">{entry.count}</span>
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {pct}%
                    </span>
                  </span>
                </div>
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <motion.div
                    className={cn("h-full rounded-full")}
                    style={{ backgroundColor: entry.color }}
                    initial={prefersReducedMotion ? undefined : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
