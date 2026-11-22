"use client"

import { useId, type ReactNode } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

export type KpiAccent = "primary" | "secondary" | "success" | "warning"

const ACCENT_STYLES: Record<
  KpiAccent,
  { chip: string; stroke: string }
> = {
  primary: { chip: "bg-primary/10 text-primary", stroke: "#0f2747" },
  secondary: { chip: "bg-secondary/10 text-secondary", stroke: "#2e5bff" },
  success: { chip: "bg-success/10 text-success", stroke: "#34a853" },
  warning: { chip: "bg-warning/10 text-warning", stroke: "#f4b400" },
}

type KpiChange = {
  direction: "up" | "down" | "stable"
  percent: number
}

function computeChange(current: number, previous: number): KpiChange | null {
  if (previous <= 0) {
    return current === 0 ? null : { direction: "up", percent: 100 }
  }
  const percent = Math.round(((current - previous) / previous) * 100)
  if (percent === 0) return { direction: "stable", percent: 0 }
  return { direction: percent > 0 ? "up" : "down", percent: Math.abs(percent) }
}

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: number
  previous?: number
  accent?: KpiAccent
  sparkline?: Array<{ date: string; count: number }>
  footnote?: string
  className?: string
}

export function KpiCard({
  icon,
  label,
  value,
  previous,
  accent = "primary",
  sparkline,
  footnote,
  className,
}: KpiCardProps) {
  const gradientId = useId().replace(/:/g, "")
  const change = previous != null ? computeChange(value, previous) : null
  const accentStyle = ACCENT_STYLES[accent]
  const hasSparkline = sparkline != null && sparkline.length > 1

  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-xl border bg-card p-5 ring-1 ring-foreground/5 transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              accentStyle.chip
            )}
          >
            {icon}
          </span>
          {change && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                change.direction === "up" && "bg-success/10 text-success",
                change.direction === "down" && "bg-error/10 text-error",
                change.direction === "stable" && "bg-muted text-muted-foreground"
              )}
            >
              {change.direction === "up" && <TrendingUp className="size-3" />}
              {change.direction === "down" && <TrendingDown className="size-3" />}
              {change.direction === "stable" && <Minus className="size-3" />}
              {change.direction === "stable" ? "0%" : `${change.percent}%`}
            </span>
          )}
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {value.toLocaleString()}
        </p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        {hasSparkline && (
          <div className="-mx-1 mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparkline}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentStyle.stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={accentStyle.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={accentStyle.stroke}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  isAnimationActive
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {footnote && <p className="mt-3 text-xs text-muted-foreground">{footnote}</p>}
    </div>
  )
}
