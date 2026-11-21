"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Filter, RotateCcw } from "lucide-react"
import { getLocalTodayDate } from "@/lib/date-utils"
import type { FilterOption } from "../types"

interface ReportFiltersProps {
  municipalities: FilterOption[]
  categories: FilterOption[]
  threshold: number
}

export function ReportFilters({ municipalities, categories, threshold }: ReportFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const today = getLocalTodayDate()

  const currentMun = searchParams.get("municipalityId") ?? ""
  const currentCat = searchParams.get("categoryId") ?? ""
  const currentStart = searchParams.get("startDate") ?? getDefaultStart()
  const rawEnd = searchParams.get("endDate") ?? getDefaultEnd()
  const currentEnd = rawEnd > today ? today : rawEnd
  const currentThreshold = searchParams.get("threshold") ?? String(threshold)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      if ((key === "startDate" || key === "endDate") && value > today) {
        value = today
      }
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.replace(`/admin/decision-support?${params.toString()}`)
    })
  }

  function resetFilters() {
    startTransition(() => {
      router.replace("/admin/decision-support")
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Start Date</label>
          <input
            type="date"
            defaultValue={currentStart}
            max={currentEnd && currentEnd < today ? currentEnd : today}
            onChange={(e) => setParam("startDate", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">End Date</label>
          <input
            type="date"
            defaultValue={currentEnd}
            min={currentStart || undefined}
            max={today}
            onChange={(e) => setParam("endDate", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Municipality</label>
          <select
            defaultValue={currentMun}
            onChange={(e) => setParam("municipalityId", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Municipalities</option>
            {municipalities.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <select
            defaultValue={currentCat}
            onChange={(e) => setParam("categoryId", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Under-promoted Threshold
          </label>
          <input
            type="number"
            min={0}
            defaultValue={currentThreshold}
            onChange={(e) => setParam("threshold", e.target.value)}
            className="block w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={resetFilters}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>

        {isPending && (
          <span className="text-xs text-muted-foreground">Updating…</span>
        )}
      </div>
    </div>
  )
}

function getDefaultStart(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().split("T")[0]
}

function getDefaultEnd(): string {
  return new Date().toISOString().split("T")[0]
}
