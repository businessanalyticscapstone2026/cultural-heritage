"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { getActivityLogAction } from "../actions/monitoring"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Users,
  QrCode,
  Sparkles,
  Bookmark,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { ActivityLogEntry, ActivityLogResult } from "../types"
import { ACTIVITY_TYPE_CONFIG } from "../utils"

interface ActivityLogTableProps {
  searchParams: Record<string, string | undefined>
  /** Optional polling fallback interval in ms */
  pollIntervalMs?: number
  initialData?: ActivityLogResult
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  QrCode,
  Sparkles,
  Bookmark,
  Star,
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

function formatUpdatedAgo(timestamp: number | null, now: number): string {
  if (!timestamp) return ""
  const diffSecs = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (diffSecs < 5) return "Updated just now"
  if (diffSecs < 60) return `Updated ${diffSecs}s ago`
  return `Updated ${Math.floor(diffSecs / 60)}m ago`
}

const ACTIVITY_PAGE_SIZE = 20

export default function ActivityLogTable({ searchParams, pollIntervalMs, initialData }: ActivityLogTableProps) {
  const [result, setResult] = useState<ActivityLogResult | null>(initialData ?? null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const requestIdRef = useRef(0)
  const spKey = JSON.stringify(searchParams)

  function applyResult(d: ActivityLogResult) {
    setResult(d)
    setError(null)
    setLastUpdated(Date.now())
  }

  function applyError(e: unknown) {
    setError(e instanceof Error ? e.message : "Failed to load activity log")
  }

  useEffect(() => {
    if (initialData && page === 1) {
      applyResult(initialData)
      return
    }
    const requestId = ++requestIdRef.current
    let cancelled = false
    getActivityLogAction(searchParams, page, ACTIVITY_PAGE_SIZE)
      .then((d) => {
        if (!cancelled && requestIdRef.current === requestId) applyResult(d)
      })
      .catch((e) => {
        if (!cancelled && requestIdRef.current === requestId) applyError(e)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, spKey, page])

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current
    try {
      const d = await getActivityLogAction(searchParams, page, ACTIVITY_PAGE_SIZE)
      if (requestIdRef.current !== requestId) return
      applyResult(d)
    } catch (e) {
      if (requestIdRef.current !== requestId) return
      applyError(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spKey, page])

  // Instant real-time updates when new tourist activities occur
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("realtime-activity-log")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tourist_visits" }, () => {
        void refresh()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "qr_scan_logs" }, () => {
        void refresh()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookmarks" }, () => {
        void refresh()
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, () => {
        void refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh])

  // Optional background poll if pollIntervalMs is provided
  useEffect(() => {
    if (!pollIntervalMs) return undefined
    const id = setInterval(() => {
      if (!document.hidden) void refresh()
    }, pollIntervalMs)
    return () => clearInterval(id)
  }, [pollIntervalMs, refresh])

  // Tick the relative "Updated Xs ago" label
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(id)
  }, [])

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (result.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity found for the selected filters
          </p>
        </CardContent>
      </Card>
    )
  }

  const pageSize = result.pageSize
  const total = result.total
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Activity Log</CardTitle>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground" aria-live="off">
              {formatUpdatedAgo(lastUpdated, now)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-3 text-left">Type</th>
                <th className="pb-2 pr-3 text-left">Site</th>
                <th className="pb-2 pr-3 text-left">Description</th>
                <th className="pb-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((entry: ActivityLogEntry) => {
                const config = ACTIVITY_TYPE_CONFIG[entry.type]
                const Icon = iconMap[config.icon]
                return (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        {Icon && <Icon className="size-4 text-muted-foreground" />}
                        <span>{config.label}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-medium">{entry.siteName}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{entry.description}</td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {formatRelativeTime(entry.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {start}-{end} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
