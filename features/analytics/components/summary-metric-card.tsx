import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Landmark,
  Sparkles,
  MousePointerClick,
  Route,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProvinceMetric } from "../types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Landmark,
  Sparkles,
  MousePointerClick,
  Route,
  Clock,
}

const accentMap: Record<string, string> = {
  Users: "bg-violet-500/10 text-violet-600",
  Landmark: "bg-primary/10 text-primary",
  Sparkles: "bg-amber-500/10 text-amber-600",
  MousePointerClick: "bg-blue-500/10 text-blue-600",
  Route: "bg-cyan-500/10 text-cyan-600",
  Clock: "bg-emerald-500/10 text-emerald-600",
}

export default function SummaryMetricCard({ metric }: { metric: ProvinceMetric }) {
  const Icon = iconMap[metric.icon] ?? Users
  const accent = accentMap[metric.icon] ?? "bg-primary/10 text-primary"

  const trendTone =
    metric.changeDirection === "up"
      ? "bg-success/10 text-success"
      : metric.changeDirection === "down"
        ? "bg-error/10 text-error"
        : "bg-muted text-muted-foreground"

  return (
    <Card className="flex h-full flex-col justify-between gap-3 py-4">
      <CardContent className="flex items-start justify-between">
        <span className={cn("flex size-9 items-center justify-center rounded-lg", accent)}>
          <Icon className="size-4" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            trendTone
          )}
        >
          {metric.changeDirection === "up" && <TrendingUp className="size-3" />}
          {metric.changeDirection === "down" && <TrendingDown className="size-3" />}
          {metric.changeDirection === "stable" && <Minus className="size-3" />}
          {metric.changeDirection === "stable"
            ? "0%"
            : `${metric.changeDirection === "down" ? "-" : "+"}${metric.changePercent}%`}
        </span>
      </CardContent>
      <CardContent className="flex flex-1 flex-col justify-between pt-0">
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {metric.value.toLocaleString()}{metric.unit ? ` ${metric.unit}` : ""}
          </p>
          <p className="text-xs font-medium text-foreground/90">{metric.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/70">vs previous period</p>
      </CardContent>
    </Card>
  )
}
