"use client"

import { useEffect, useState } from "react"
import { getDashboardStatsAction } from "../actions/dashboard"
import StatCard from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardStat } from "@/types/mto-dashboard"

export default function StatCardsRow() {
  const [stats, setStats] = useState<DashboardStat[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setStats(null)
    getDashboardStatsAction()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  }

  useEffect(() => {
    let cancelled = false
    getDashboardStatsAction()
      .then((result) => {
        if (!cancelled) setStats(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div className="rounded-md border p-4 text-sm text-destructive">
        <p>{error}</p>
        <button type="button" onClick={load} className="mt-2 text-xs text-primary hover:underline">
          Retry
        </button>
      </div>
    )
  }

  if (!stats) {
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
