"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { FIRST_DISTRICT_MUNICIPALITIES } from "@/lib/constants"
import { getLocalTodayDate } from "@/lib/date-utils"

interface FilterBarProps {
  categories: { id: string; name: string }[]
}

export default function FilterBar({ categories }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      router.push(`?${params.toString()}`)
    },
    [router, searchParams, today, dateFrom, dateTo]
  )

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
        <label htmlFor="municipality" className="text-xs font-medium text-muted-foreground">Municipality</label>
        <select
          id="municipality"
          value={searchParams.get("municipality") ?? ""}
          onChange={(e) => update("municipality", e.target.value)}
          className="h-9 rounded-md border bg-card px-3 text-sm"
        >
          <option value="">All Municipalities</option>
          {FIRST_DISTRICT_MUNICIPALITIES.map((name) => (
            <option key={name} value={name}>{name}</option>
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
    </div>
  )
}
