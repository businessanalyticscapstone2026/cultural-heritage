"use client"

import { useEffect, useState } from "react"
import { getRecentActivityAction } from "../actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, QrCode, Bookmark, Star } from "lucide-react"
import type { TouristActivity, ActivityType } from "@/types/mto-dashboard"
import { formatDistanceToNow } from "@/lib/format-time"

const typeIcon: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  visit: MapPin,
  qr_scan: QrCode,
  bookmark: Bookmark,
  review: Star,
}

const typeColor: Record<ActivityType, string> = {
  visit: "bg-blue-100 text-blue-700",
  qr_scan: "bg-purple-100 text-purple-700",
  bookmark: "bg-amber-100 text-amber-700",
  review: "bg-green-100 text-green-700",
}

export default function TouristActivitiesList() {
  const [activities, setActivities] = useState<TouristActivity[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setActivities(null)
    getRecentActivityAction()
      .then(setActivities)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
  }

  useEffect(() => {
    let cancelled = false
    getRecentActivityAction()
      .then((result) => {
        if (!cancelled) setActivities(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      })
    return () => { cancelled = true }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tourist Activities Today</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive">
            <p>{error}</p>
            <button type="button" onClick={load} className="mt-1 text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        )}
        {!activities && !error && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {activities && activities.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
        )}
        {activities && activities.length > 0 && (
          <ul className="space-y-3">
            {activities.map((activity) => {
              const Icon = typeIcon[activity.type]
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${typeColor[activity.type]}`}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug">{activity.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activity.siteName} · {formatDistanceToNow(new Date(activity.timestamp))}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
