"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import StatCard from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStat } from "@/types/mto-dashboard"

const selectData = (data: { stats: DashboardStat[] }) => data.stats

export default function StatCardsRow({ municipalityId }: { municipalityId: string }) {
  const { data: stats, isPending, isError, error, refetch } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

  if (isError) {
    return (
      <div className="rounded-md border p-4 text-sm text-destructive">
        <p>{error instanceof Error ? error.message : "Failed to load"}</p>
        <button type="button" onClick={() => refetch()} className="mt-2 text-xs text-primary hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  )
}
