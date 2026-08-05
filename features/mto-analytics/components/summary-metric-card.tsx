import { Card, CardContent } from "@/components/ui/card"
import {
  Users,
  Landmark,
  Sparkles,
  Route,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MTOMetric } from "../types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Landmark,
  Sparkles,
  Route,
  Clock,
}

export default function SummaryMetricCard({ metric }: { metric: MTOMetric }) {
  const Icon = iconMap[metric.icon] ?? Users
  const rising = metric.changeDirection === "up"
  const falling = metric.changeDirection === "down"

  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            rising ? "text-success" : falling ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {rising && (
            <>
              <TrendingUp className="size-3" />
              <span>+{metric.changePercent}%</span>
            </>
          )}
          {falling && (
            <>
              <TrendingDown className="size-3" />
              <span>-{metric.changePercent}%</span>
            </>
          )}
          {metric.changeDirection === "stable" && (
            <>
              <Minus className="size-3" />
              <span>0%</span>
            </>
          )}
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {metric.value.toLocaleString()}{metric.unit ? ` ${metric.unit}` : ""}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{metric.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
      </CardContent>
    </Card>
  )
}
