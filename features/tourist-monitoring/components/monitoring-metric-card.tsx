import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  Users,
  MousePointerClick,
  Route,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import type { MonitoringMetric } from "../types"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  Users,
  MousePointerClick,
  Route,
}

interface MonitoringMetricCardProps {
  metric: MonitoringMetric
  isActive?: boolean
  onClick?: () => void
}

export default function MonitoringMetricCard({
  metric,
  isActive,
  onClick,
}: MonitoringMetricCardProps) {
  const Icon = iconMap[metric.icon] ?? Activity

  return (
    <Card
      className={`gap-3 py-4 ${isActive ? "ring-2 ring-primary ring-offset-2" : ""} ${onClick ? "cursor-pointer" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <CardContent className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="flex items-center gap-1 text-xs">
          {metric.changeDirection === "up" && metric.changePercent !== null && (
            <>
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+{metric.changePercent}%</span>
            </>
          )}
          {metric.changeDirection === "down" && metric.changePercent !== null && (
            <>
              <TrendingDown className="size-3 text-red-600" />
              <span className="text-red-600">-{metric.changePercent}%</span>
            </>
          )}
          {metric.changeDirection === "stable" && (
            <>
              <Minus className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">0%</span>
            </>
          )}
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {metric.value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{metric.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{metric.description}</p>
      </CardContent>
    </Card>
  )
}
