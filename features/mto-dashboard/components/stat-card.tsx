import { Card, CardContent } from "@/components/ui/card"
import {
  Landmark,
  Users,
  Bookmark,
  Sparkles,
  QrCode,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import type { DashboardStat } from "@/types/mto-dashboard"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Users,
  Bookmark,
  Sparkles,
  QrCode,
}

export default function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = iconMap[stat.icon] ?? Landmark

  return (
    <Card className="gap-3 py-4">
      <CardContent className="flex items-start justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="flex items-center gap-1 text-xs">
          {stat.changeDirection === "up" && stat.changePercent !== null && (
            <>
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-green-600">+{stat.changePercent}%</span>
            </>
          )}
          {stat.changeDirection === "down" && stat.changePercent !== null && (
            <>
              <TrendingDown className="size-3 text-red-600" />
              <span className="text-red-600">-{stat.changePercent}%</span>
            </>
          )}
          {stat.changeDirection === "stable" && (
            <>
              <Minus className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">0%</span>
            </>
          )}
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {stat.value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{stat.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">{stat.description}</p>
      </CardContent>
    </Card>
  )
}
