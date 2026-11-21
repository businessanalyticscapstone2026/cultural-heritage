"use client"

import { useState } from "react"
import { Settings2, Play } from "lucide-react"
import { getLocalTodayDate } from "@/lib/date-utils"
import type { MTOReportFilters, ReportType } from "../types"
import { REPORT_TYPE_MAP } from "../constants"

interface FilterOption {
  id: string
  name: string
}

interface ReportConfigPanelProps {
  reportType: ReportType
  categories: FilterOption[]
  initialFilters: MTOReportFilters
  onGenerate: (filters: MTOReportFilters) => void
  isGenerating: boolean
}

export default function ReportConfigPanel({
  reportType,
  categories,
  initialFilters,
  onGenerate,
  isGenerating,
}: ReportConfigPanelProps) {
  const [filters, setFilters] = useState<MTOReportFilters>(initialFilters)
  const reportDef = REPORT_TYPE_MAP[reportType]

  const today = getLocalTodayDate()

  const updateFilter = <K extends keyof MTOReportFilters>(
    key: K,
    value: MTOReportFilters[K],
  ) => {
    let safeValue = value
    if (typeof safeValue === "string" && (key === "dateFrom" || key === "dateTo")) {
      if (safeValue > today) safeValue = today as MTOReportFilters[K]
    }
    setFilters((prev) => ({ ...prev, [key]: safeValue }))
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Settings2 className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Configure Report</span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {reportDef?.title} — set the scope for your report
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Start Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo && filters.dateTo < today ? filters.dateTo : today}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">End Date</label>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            max={today}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </div>

        {reportType !== "heritage_inventory" && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Category</label>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) =>
                updateFilter("categoryId", e.target.value || null)
              }
              className="block rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={() => onGenerate(filters)}
          disabled={isGenerating}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="size-3.5" />
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
      </div>
    </div>
  )
}
