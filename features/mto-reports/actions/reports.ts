"use server"

import type { ReportType, MTOReportFilters } from "../types"
import {
  resolveMunicipalityId,
  getReportDataForType,
  saveGeneratedReport,
  getGeneratedReports,
  deleteGeneratedReport,
} from "../services"
import { REPORT_TYPE_MAP } from "../constants"

export async function generateReportAction(
  reportType: ReportType,
  filters: MTOReportFilters,
) {
  const municipalityId = await resolveMunicipalityId()
  const reportDef = REPORT_TYPE_MAP[reportType]
  if (!reportDef) throw new Error("Invalid report type")

  const data = await getReportDataForType(reportType, municipalityId, filters)

  const title = `${reportDef.title} — ${new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}`

  await saveGeneratedReport(reportType, title, filters)

  return { data, title, reportType }
}

export async function getReportHistoryAction() {
  return getGeneratedReports()
}

export async function deleteReportFromHistoryAction(reportId: string) {
  await deleteGeneratedReport(reportId)
  return { success: true }
}
