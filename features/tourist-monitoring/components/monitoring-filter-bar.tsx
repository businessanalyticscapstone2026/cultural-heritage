"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { RotateCcw, Loader2 } from "lucide-react"
import { getLocalTodayDate } from "@/lib/date-utils"

interface MonitoringFilterBarProps {
  categories: { id: string; name: string }[]
  sites: { id: string; name: string }[]
}

export default function MonitoringFilterBar({ categories, sites }: MonitoringFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const today = getLocalTodayDate()

  const dateFrom = searchParams.get("dateFrom") ?? ""
  const dateTo = searchParams.get("dateTo") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        let safeValue = value
        if (key === "dateFrom" || key === "dateTo") {
          if (safeValue > today) safeValue = today
          if (key === "dateFrom" && dateTo && safeValue > dateTo) {
            safeValue = dateTo
          }
          if (key === "dateTo" && dateFrom && safeValue < dateFrom) {
            safeValue = dateFrom
          }
        }
        params.set(key, safeValue)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`?${params.toString()}`, { scroll: false })
      })
    },
    [router, searchParams, today, dateFrom, dateTo]
  )

  const reset = useCallback(() => {
    startTransition(() => {
      router.push("?", { scroll: false })
    })
  }, [router])

  const hasFilters = [
    searchParams.get("dateFrom"),
    searchParams.get("dateTo"),
    searchParams.get("siteId"),
    searchParams.get("category"),
    searchParams.get("activityType"),
  ].some(Boolean)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">From</label>
        <input
          id="dateFrom"
          type="date"
          value={dateFrom}
          max={dateTo && dateTo < today ? dateTo : today}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">To</label>
        <input
          id="dateTo"
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={today}
          onChange={(e) => update("dateTo", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="siteId" className="text-xs font-medium text-muted-foreground">Site</label>
        <select
          id="siteId"
          value={searchParams.get("siteId") ?? ""}
          onChange={(e) => update("siteId", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">All Sites</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="category" className="text-xs font-medium text-muted-foreground">Category</label>
        <select
          id="category"
          value={searchParams.get("category") ?? ""}
          onChange={(e) => update("category", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label htmlFor="activityType" className="text-xs font-medium text-muted-foreground">Activity Type</label>
        <select
          id="activityType"
          value={searchParams.get("activityType") ?? ""}
          onChange={(e) => update("activityType", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">All Activities</option>
          <option value="visit">Site Visit</option>
          <option value="qr_scan">QR Scan</option>
          <option value="recommendation_click">Recommendation</option>
          <option value="bookmark">Bookmark</option>
          <option value="review">Review</option>
        </select>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={reset}
          disabled={isPending}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      )}
      {isPending && (
        <div className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Updating...</span>
        </div>
      )}
    </div>
  )
}
