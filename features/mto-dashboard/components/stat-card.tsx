import { Card, CardContent } from "@/components/ui/card"
import {
  Landmark,
  Users,
  Bookmark,
  Sparkles,
  QrCode,
  ScanLine,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DashboardStat } from "@/types/mto-dashboard"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Landmark,
  Users,
  Bookmark,
  Sparkles,
  QrCode,
  ScanLine,
}

export default function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = iconMap[stat.icon] ?? Landmark
  const rising = stat.changeDirection === "up"
  const falling = stat.changeDirection === "down"

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
          {rising && stat.changePercent !== null && (
            <>
              <TrendingUp className="size-3" />
              <span>+{stat.changePercent}%</span>
            </>
          )}
          {falling && stat.changePercent !== null && (
            <>
              <TrendingDown className="size-3" />
              <span>-{stat.changePercent}%</span>
            </>
          )}
          {stat.changeDirection === "stable" && (
            <>
              <Minus className="size-3" />
              <span>0%</span>
            </>
          )}
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {stat.value.toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{stat.description}</p>
      </CardContent>
    </Card>
  )
}

