import type { MTOReportFilters, ReportType } from "./types"

export type { ReportType, MTOReportFilters, GeneratedReport } from "./types"
export type {
  TourismTrendReportData,
  HeritageInventoryReportData,
  VisitorStatisticsReportData,
  RecommendationQRReportData,
} from "./types"
export { REPORT_TYPES, REPORT_TYPE_MAP } from "./constants"

export function parseReportFilters(
  params: Record<string, string | undefined>,
): MTOReportFilters {
  const now = new Date()
  const defaultFrom = new Date()
  defaultFrom.setMonth(defaultFrom.getMonth() - 1)

  return {
    dateFrom: params.dateFrom ?? defaultFrom.toISOString().split("T")[0],
    dateTo: params.dateTo ?? now.toISOString().split("T")[0],
    categoryId: params.categoryId ?? null,
  }
}

export function parseReportType(
  params: Record<string, string | undefined>,
): ReportType | null {
  const val = params.reportType
  if (!val) return null
  const valid: ReportType[] = [
    "tourism_trend",
    "heritage_inventory",
    "visitor_statistics",
    "recommendation_qr",
  ]
  return valid.includes(val as ReportType) ? (val as ReportType) : null
}
