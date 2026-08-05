"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import ChartCard from "@/components/charts/chart-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { CategoryDistributionPoint } from "@/types/mto-dashboard"

const selectData = (data: { categoryDistribution: CategoryDistributionPoint[] }) => data.categoryDistribution

export default function CategoryProgress({ municipalityId }: { municipalityId: string }) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  return (
    <ChartCard title="Sites by Category" description="Distribution of heritage sites">
      {isError && (
        <div className="text-sm text-destructive">
          <p>{error instanceof Error ? error.message : "Failed to load"}</p>
          <button type="button" onClick={() => refetch()} className="mt-1 text-xs text-primary hover:underline">
            Retry
          </button>
        </div>
      )}
      {isPending && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      )}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No heritage sites yet</p>
      )}
      {data && data.length > 0 && (
        <div className="space-y-4">
          {data.map((entry) => (
            <div key={entry.name}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.count}</span>
                  <span className="w-10 text-right text-xs text-muted-foreground">{entry.percentage}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${entry.percentage}%`, backgroundColor: entry.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}
