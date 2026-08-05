"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { getVisitsByMunicipalityAction } from "../actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ChartTooltip } from "@/components/charts/chart-tooltip"
import { cn } from "@/lib/utils"
import type { MunicipalityVisit, AnalyticsFilters } from "../types"

export default function VisitsByMunicipalityPanel({
  filters,
}: {
  filters: AnalyticsFilters
}) {
  const prefersReducedMotion = useReducedMotion()
  const [data, setData] = useState<MunicipalityVisit[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false
    getVisitsByMunicipalityAction(
      { dateFrom: filters.dateFrom, dateTo: filters.dateTo, municipality: filters.municipalityId ?? undefined, category: filters.categoryId ?? undefined }
    )
      .then((d) => { if (!cancelled) setData(d) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed") })
    return () => { cancelled = true }
  }, [filterKey, filters])

  const total = data ? data.reduce((sum, d) => sum + d.visits, 0) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Visits by Municipality</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-sm text-destructive"><p>{error}</p></div>}
        {!data && !error && <Skeleton className="h-[300px] w-full" />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No visit data</p>
        )}
        {data && data.length > 0 && (
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="visits"
                    nameKey="municipalityName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    strokeWidth={0}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={entry.municipalityId}
                        fill={entry.color}
                        stroke="none"
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                        onMouseEnter={() => setActiveIndex(i)}
                        className="cursor-pointer transition-opacity"
                      />
                    ))}
                  </Pie>
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-base font-bold">
                    {total.toLocaleString()}
                  </text>
                  <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
                    Total Visits
                  </text>
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(value) => `${value.toLocaleString()} visits`}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-2 md:w-1/2">
              {data.map((muni, i) => (
                <div
                  key={muni.municipalityId}
                  className={cn(
                    "cursor-default rounded-md px-1.5 py-1 transition-colors",
                    activeIndex === i && "bg-muted"
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: muni.color }} />
                      <span>{muni.municipalityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{muni.visits.toLocaleString()}</span>
                      <span className="w-10 text-right text-xs text-muted-foreground">{muni.percentage}%</span>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: muni.color }}
                      initial={prefersReducedMotion ? undefined : { width: 0 }}
                      animate={{ width: `${muni.percentage}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
