"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { getAllDashboardDataAction } from "../actions/dashboard"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { ROUTES } from "@/lib/constants"
import { formatCategoryName } from "@/lib/format-category"
import type { CategoryBreakdownPoint } from "@/types/mto-dashboard"

const selectData = (data: { visitsByCategory: CategoryBreakdownPoint[] }) => data.visitsByCategory

export default function VisitsByAttractionChart({ municipalityId }: { municipalityId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  const total = data ? data.reduce((sum, d) => sum + d.value, 0) : 0

  return (
    <ChartCard
      title="Visits by Attraction"
      description="Share of visits by category"
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
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No visit data yet</p>
      )}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-lg font-bold">
                  {total.toLocaleString()}
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[11px]">
                  Total Visits
                </text>
                <Tooltip
                  formatter={(value) => [Number(value ?? 0).toLocaleString(), "Visits"]}
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
          <div className="w-full space-y-1.5 md:w-1/2">
            {data.map((entry) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
              return (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{formatCategoryName(entry.name)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.value.toLocaleString()}</span>
                    <span className="w-10 text-right text-xs text-muted-foreground">{pct}%</span>
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
