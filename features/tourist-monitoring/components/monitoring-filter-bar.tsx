"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface MonitoringFilterBarProps {
  categories: { id: string; name: string }[]
  sites: { id: string; name: string }[]
}

export default function MonitoringFilterBar({ categories, sites }: MonitoringFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">From</label>
        <input
          id="dateFrom"
          type="date"
          value={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">To</label>
        <input
          id="dateTo"
          type="date"
          value={searchParams.get("dateTo") ?? ""}
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
    </div>
  )
}
