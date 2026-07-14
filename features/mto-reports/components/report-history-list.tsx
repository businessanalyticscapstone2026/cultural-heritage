"use client"

import { useState } from "react"
import { Clock, Trash2, RefreshCw } from "lucide-react"
import type { GeneratedReport, ReportType } from "../types"
import { REPORT_TYPE_MAP } from "../constants"
import {
  deleteReportFromHistoryAction,
} from "../actions/reports"

interface ReportHistoryListProps {
  reports: GeneratedReport[]
  onRegenerate: (reportType: ReportType) => void
  onDelete: (reportId: string) => void
}

const reportTypeBadgeColors: Record<string, string> = {
  tourism_trend: "bg-blue-100 text-blue-700",
  heritage_inventory: "bg-amber-100 text-amber-700",
  visitor_statistics: "bg-green-100 text-green-700",
  recommendation_qr: "bg-purple-100 text-purple-700",
}

export default function ReportHistoryList({
  reports,
  onRegenerate,
  onDelete,
}: ReportHistoryListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (reportId: string) => {
    setDeleting(reportId)
    try {
      await deleteReportFromHistoryAction(reportId)
      onDelete(reportId)
    } finally {
      setDeleting(null)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Report History</span>
        </div>
        <p className="mt-3 py-6 text-center text-sm text-muted-foreground">
          No reports generated yet. Select a report type above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Report History</span>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {reports.length}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {reports.map((report) => {
          const reportDef = REPORT_TYPE_MAP[report.reportType]
          const badgeColor = reportTypeBadgeColors[report.reportType] ?? "bg-gray-100 text-gray-700"

          return (
            <div
              key={report.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{report.reportTitle}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColor}`}>
                    {reportDef?.title ?? report.reportType}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(report.generatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onRegenerate(report.reportType)}
                  title="Re-generate this report"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(report.id)}
                  disabled={deleting === report.id}
                  title="Delete from history"
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
