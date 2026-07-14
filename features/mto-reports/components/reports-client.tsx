"use client"

import { useState, useTransition } from "react"
import type {
  ReportType,
  MTOReportFilters,
  GeneratedReport,
} from "../types"
import type {
  TourismTrendReportData,
  HeritageInventoryReportData,
  VisitorStatisticsReportData,
  RecommendationQRReportData,
} from "../types"
import { REPORT_TYPE_MAP } from "../constants"
import ReportTypeSelector from "./report-type-selector"
import ReportConfigPanel from "./report-config-panel"
import ReportExportPanel from "./report-export-panel"
import ReportHistoryList from "./report-history-list"
import ReportShell from "./templates/report-shell"
import TourismTrendReport from "./templates/tourism-trend-report"
import HeritageInventoryReport from "./templates/heritage-inventory-report"
import VisitorStatisticsReport from "./templates/visitor-statistics-report"
import RecommendationQRReport from "./templates/recommendation-qr-report"
import { generateReportAction, getReportHistoryAction } from "../actions/reports"

interface FilterOption {
  id: string
  name: string
}

interface ReportsClientProps {
  categories: FilterOption[]
  municipalityName: string
  initialHistory: GeneratedReport[]
  initialFilters: MTOReportFilters
}

export default function ReportsClient({
  categories,
  municipalityName,
  initialHistory,
  initialFilters,
}: ReportsClientProps) {
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)
  const [reportTitle, setReportTitle] = useState("")
  const [history, setHistory] = useState<GeneratedReport[]>(initialHistory)
  const [isPending, startTransition] = useTransition()

  const handleSelectType = (type: ReportType) => {
    setSelectedType(type)
    setReportData(null)
    setReportTitle("")
  }

  const handleGenerate = (filters: MTOReportFilters) => {
    if (!selectedType) return

    startTransition(async () => {
      try {
        const result = await generateReportAction(selectedType, filters)
        setReportData(result.data)
        setReportTitle(result.title)

        const updatedHistory = await getReportHistoryAction()
        setHistory(updatedHistory)
      } catch (err) {
        console.error("Failed to generate report:", err)
      }
    })
  }

  const handleRegenerate = (reportType: ReportType) => {
    setSelectedType(reportType)
    setReportData(null)
    setReportTitle("")
  }

  const handleDeleteFromHistory = (reportId: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== reportId))
  }

  const reportDef = selectedType ? REPORT_TYPE_MAP[selectedType] : null

  return (
    <div className="space-y-6">
      <ReportTypeSelector selected={selectedType} onSelect={handleSelectType} />

      {selectedType && (
        <ReportConfigPanel
          reportType={selectedType}
          categories={categories}
          initialFilters={initialFilters}
          onGenerate={handleGenerate}
          isGenerating={isPending}
        />
      )}

      {selectedType && reportData != null && reportDef && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_240px]">
          <div id="report-preview">
            <ReportShell
              reportType={selectedType}
              title={reportTitle}
              municipalityName={municipalityName}
              filters={initialFilters}
            >
              <ReportContent
                reportType={selectedType}
                data={reportData}
              />
            </ReportShell>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6">
              <ReportExportPanel sections={reportDef.sections} />
            </div>
          </aside>
        </div>
      )}

      <ReportHistoryList
        reports={history}
        onRegenerate={handleRegenerate}
        onDelete={handleDeleteFromHistory}
      />
    </div>
  )
}

function ReportContent({
  reportType,
  data,
}: {
  reportType: ReportType
  data: unknown
}): React.ReactNode {
  switch (reportType) {
    case "tourism_trend":
      return <TourismTrendReport data={data as unknown as TourismTrendReportData} />
    case "heritage_inventory":
      return <HeritageInventoryReport data={data as unknown as HeritageInventoryReportData} />
    case "visitor_statistics":
      return <VisitorStatisticsReport data={data as unknown as VisitorStatisticsReportData} />
    case "recommendation_qr":
      return <RecommendationQRReport data={data as unknown as RecommendationQRReportData} />
    default:
      return null
  }
}
