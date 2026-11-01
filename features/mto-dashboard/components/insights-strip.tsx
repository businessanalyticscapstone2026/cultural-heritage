"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllDashboardDataAction } from "../actions/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ScanLine, Trophy, LayoutGrid, Globe, TrendingUp, TrendingDown, Wrench, Megaphone, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardInsight, InsightTone } from "@/types/mto-dashboard"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ScanLine,
  Trophy,
  LayoutGrid,
  Globe,
  TrendingUp,
  TrendingDown,
  Wrench,
  Megaphone,
  Smile,
}

const toneStyles: Record<InsightTone, string> = {
  positive: "bg-success/10 text-success border-success/20",
  negative: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-muted",
  info: "bg-primary/10 text-primary border-primary/20",
}

const selectData = (data: { insights: DashboardInsight[] }) => data.insights

function InsightCard({ insight }: { insight: DashboardInsight }) {
  const Icon = iconMap[insight.icon] ?? TrendingUp

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", toneStyles[insight.tone])}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background/60">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-80">{insight.label}</p>
        <p className="mt-0.5 truncate text-sm font-bold tracking-tight">{insight.value}</p>
        <p className="mt-0.5 text-xs opacity-70">{insight.detail}</p>
      </div>
    </div>
  )
}

export default function InsightsStrip({ municipalityId }: { municipalityId: string }) {
  const { data: insights, isPending, isError } = useQuery({
    queryKey: ["mto-dashboard", municipalityId],
    queryFn: () => getAllDashboardDataAction(municipalityId),
    select: selectData,
    staleTime: 60_000,
  })

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError || !insights || insights.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
