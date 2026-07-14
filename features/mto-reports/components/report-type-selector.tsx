"use client"

import { TrendingUp, Landmark, BarChart3, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReportType } from "../types"
import { REPORT_TYPES } from "../constants"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  Landmark,
  BarChart3,
  QrCode,
}

interface ReportTypeSelectorProps {
  selected: ReportType | null
  onSelect: (type: ReportType) => void
}

export default function ReportTypeSelector({ selected, onSelect }: ReportTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {REPORT_TYPES.map((report) => {
        const Icon = iconMap[report.icon] ?? TrendingUp
        const isSelected = selected === report.id

        return (
          <button
            key={report.id}
            type="button"
            onClick={() => onSelect(report.id)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5",
              isSelected &&
                "border-primary bg-primary/5 ring-1 ring-primary/20",
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{report.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {report.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
