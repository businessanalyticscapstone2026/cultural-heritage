import { notifySuccess, notifyError, errorReason } from "@/lib/toast"
import type {
  UnderPromotedSite,
  MunicipalityPerformance,
  CategoryDemand,
  ResourceAllocation,
} from "../types"

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(",")
  const body = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")
  return `${headerLine}\n${body}`
}

function downloadCsv(content: string, filename: string): void {
  try {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    notifySuccess(`Exported ${filename}.`)
  } catch (err) {
    notifyError(errorReason(err, "Failed to export CSV. Please try again."))
  }
}

export function exportUnderPromotedSites(data: UnderPromotedSite[]): void {
  const headers = ["Site Name", "Municipality", "Category", "Recommendation Count", "Visit Count"]
  const rows = data.map((s) => [
    s.siteName,
    s.municipalityName,
    s.categoryName,
    String(s.recommendationCount),
    String(s.visitCount),
  ])
  downloadCsv(toCsv(headers, rows), "under-promoted-sites.csv")
}

export function exportMunicipalityPerformance(data: MunicipalityPerformance[]): void {
  const headers = [
    "Municipality",
    "Total Visitors",
    "Local",
    "Domestic",
    "International",
  ]
  const rows = data.map((m) => [
    m.municipalityName,
    String(m.totalVisitors),
    String(m.localCount),
    String(m.domesticCount),
    String(m.internationalCount),
  ])
  downloadCsv(toCsv(headers, rows), "municipality-performance.csv")
}

export function exportCategoryDemand(data: CategoryDemand[]): void {
  const headers = ["Category", "Recommendation Count", "Visit Count"]
  const rows = data.map((c) => [
    c.categoryName,
    String(c.recommendationCount),
    String(c.visitCount),
  ])
  downloadCsv(toCsv(headers, rows), "category-demand.csv")
}

export function exportResourceAllocation(data: ResourceAllocation[]): void {
  const headers = [
    "Municipality",
    "Visitor Volume",
    "Route Count",
    "Route Stop Count",
    "Composite Score",
  ]
  const rows = data.map((r) => [
    r.municipalityName,
    String(r.visitorVolume),
    String(r.routeCount),
    String(r.routeStopCount),
    String(r.compositeScore),
  ])
  downloadCsv(toCsv(headers, rows), "resource-allocation.csv")
}
