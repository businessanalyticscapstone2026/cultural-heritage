"use client"

import { useEffect, useState } from "react"
import { getActivityLogAction } from "../actions/monitoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"
import type { ActivityLogEntry, MonitoringActivityType } from "../types"
import { ACTIVITY_TYPE_CONFIG } from "../utils"

interface DrillDownPanelProps {
  searchParams: Record<string, string | undefined>
  drillDownType: MonitoringActivityType | "all"
  onClose: () => void
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function DrillDownPanel({
  searchParams,
  drillDownType,
  onClose,
}: DrillDownPanelProps) {
  const [entries, setEntries] = useState<ActivityLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const modifiedParams = { ...searchParams }
  if (drillDownType !== "all") {
    modifiedParams.activityType = drillDownType
  }

  const spKey = JSON.stringify(modifiedParams)

  useEffect(() => {
    let cancelled = false
    getActivityLogAction(modifiedParams, 1, 20)
      .then((d) => {
        if (!cancelled) setEntries(d.items)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load activity log")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey])

  const title =
    drillDownType === "all"
      ? "All Activities"
      : drillDownType === "visit"
        ? "Site Visits"
        : drillDownType === "qr_scan"
          ? "QR Scans"
          : drillDownType === "recommendation_click"
            ? "Recommendation Clicks"
            : drillDownType === "bookmark"
              ? "Bookmarks"
              : "Reviews"

  return (
    <Card className="ring-1 ring-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {entries === null && !error && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {error && <p className="py-8 text-center text-sm text-destructive">{error}</p>}

        {entries !== null && !error && entries.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No matching activities found
          </p>
        )}

        {entries !== null && !error && entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-3 text-left">Type</th>
                  <th className="pb-2 pr-3 text-left">Site</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: ActivityLogEntry) => {
                  const config = ACTIVITY_TYPE_CONFIG[entry.type]
                  return (
                    <tr key={entry.id} className="border-b last:border-0 text-sm">
                      <td className="py-2.5 pr-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <span>{config.label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 font-medium">{entry.siteName}</td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {formatRelativeTime(entry.timestamp)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
