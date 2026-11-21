import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type {
  ReportType,
  MTOReportFilters,
  GeneratedReport,
  TourismTrendReportData,
  HeritageInventoryReportData,
  VisitorStatisticsReportData,
  RecommendationQRReportData,
} from "../types"
import {
  getSummaryMetrics,
  getVisitorTrend,
  getVisitsByAttraction,
  getDemographics,
  getTopSites,
  getRecommendationPerformance,
} from "@/features/mto-analytics/services"
import { getMtoSites } from "@/features/heritage/services/mto-sites"
import type { MTOAnalyticsFilters } from "@/features/mto-analytics/types"

async function getSupabase() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

async function resolveMunicipalityId(): Promise<string> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) throw new Error("No municipality assigned")
  return profile.municipality_id
}

function toAnalyticsFilters(filters: MTOReportFilters): MTOAnalyticsFilters {
  return {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categoryId: filters.categoryId,
  }
}

export async function getTourismTrendData(
  municipalityId: string,
  filters: MTOReportFilters,
): Promise<TourismTrendReportData> {
  const analyticsFilters = toAnalyticsFilters(filters)

  const [summaryMetrics, visitorTrend, visitsByAttraction, demographics] =
    await Promise.all([
      getSummaryMetrics(municipalityId, analyticsFilters),
      getVisitorTrend(municipalityId, analyticsFilters, "daily"),
      getVisitsByAttraction(municipalityId, analyticsFilters),
      getDemographics(municipalityId, analyticsFilters),
    ])

  const totalVisitors = summaryMetrics.find((m) => m.label === "Total Visitors")?.value ?? 0
  const totalSitesVisited = summaryMetrics.find((m) => m.label === "Heritage Sites Visited")?.value ?? 0
  const totalRecommendations = summaryMetrics.find((m) => m.label === "Recommendations Generated")?.value ?? 0

  return {
    summary: {
      totalVisitors,
      totalSitesVisited,
      avgRating: 0,
      totalRecommendations,
    },
    visitorTrend: visitorTrend.map((p) => ({ period: p.period, visitors: p.visitors })),
    visitsByAttraction: visitsByAttraction.map((a) => ({
      categoryName: a.categoryName,
      visits: a.visits,
      percentage: a.percentage,
    })),
    demographics,
  }
}

export async function getHeritageInventoryData(
  municipalityId: string,
): Promise<HeritageInventoryReportData> {
  const sites = await getMtoSites(municipalityId)

  const categoryBreakdown: Record<string, number> = {}
  for (const site of sites) {
    const cat = site.category?.name ?? "Uncategorized"
    categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + 1
  }

  return {
    summary: {
      totalSites: sites.length,
      publishedCount: sites.filter((s) => s.publicationStatus === "published").length,
      draftCount: sites.filter((s) => s.publicationStatus === "draft").length,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([categoryName, count]) => ({
        categoryName,
        count,
      })),
    },
    sites: sites.map((s) => ({
      id: s.id,
      siteName: s.siteName,
      categoryName: s.category?.name ?? null,
      municipalityName: null,
      barangay: s.barangay,
      publicationStatus: s.publicationStatus,
      createdAt: s.createdAt,
      latitude: s.latitude,
      longitude: s.longitude,
    })),
  }
}

export async function getVisitorStatisticsData(
  municipalityId: string,
  filters: MTOReportFilters,
): Promise<VisitorStatisticsReportData> {
  const analyticsFilters = toAnalyticsFilters(filters)

  const [summaryMetrics, demographics, topSites] = await Promise.all([
    getSummaryMetrics(municipalityId, analyticsFilters),
    getDemographics(municipalityId, analyticsFilters),
    getTopSites(municipalityId, analyticsFilters),
  ])

  const totalVisitors = summaryMetrics.find((m) => m.label === "Total Visitors")?.value ?? 0
  const local = demographics.visitorTypes.find((v) => v.type === "local")?.count ?? 0
  const domestic = demographics.visitorTypes.find((v) => v.type === "domestic")?.count ?? 0
  const international = demographics.visitorTypes.find((v) => v.type === "international")?.count ?? 0

  return {
    summary: {
      totalVisitors,
      localCount: local,
      domesticCount: domestic,
      internationalCount: international,
    },
    visitorTypes: demographics.visitorTypes.map((v) => ({
      type: v.type,
      count: v.count,
      percentage: v.percentage,
    })),
    topSites: topSites.map((s) => ({
      siteId: s.siteId,
      siteName: s.siteName,
      categoryName: s.categoryName,
      visits: s.visits,
      percentage: s.percentage,
    })),
  }
}

export async function getRecommendationQRData(
  municipalityId: string,
  filters: MTOReportFilters,
): Promise<RecommendationQRReportData> {
  const analyticsFilters = toAnalyticsFilters(filters)
  const supabase = await getSupabase()

  const [recPerformance, summaryMetrics] = await Promise.all([
    getRecommendationPerformance(municipalityId, analyticsFilters),
    getSummaryMetrics(municipalityId, analyticsFilters),
  ])

  const totalRecs = summaryMetrics.find((m) => m.label === "Recommendations Generated")?.value ?? 0

  const siteIds = await supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)
    .then(({ data }) => (data ?? []).map((s) => s.id))

  let totalScans = 0
  let uniqueSiteCount = 0

  if (siteIds.length > 0) {
    // Bug 2 fix: qr_scan_logs has no site_id column — join through qr_codes first
    const { data: qrCodes } = await supabase
      .from("qr_codes")
      .select("id, site_id")
      .in("site_id", siteIds)

    const qrCodeIds = (qrCodes ?? []).map((q) => q.id as string)
    const qrCodeToSite = new Map<string, string>(
      (qrCodes ?? []).map((q) => [q.id as string, q.site_id as string])
    )

    if (qrCodeIds.length > 0) {
      const { data: scans } = await supabase
        .from("qr_scan_logs")
        .select("qr_code_id")
        .in("qr_code_id", qrCodeIds)
        .gte("scanned_at", filters.dateFrom + "T00:00:00")
        .lte("scanned_at", filters.dateTo + "T23:59:59")

      totalScans = scans?.length ?? 0
      const uniqueSites = new Set((scans ?? []).map((s) => qrCodeToSite.get(s.qr_code_id as string)))
      uniqueSiteCount = uniqueSites.size
    }
  }

  const daysDiff = Math.max(
    1,
    Math.ceil(
      (new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  )

  return {
    funnel: {
      generated: totalRecs,
      clicked: recPerformance.clicked,
      routePlans: recPerformance.routePlans,
      conversions: recPerformance.conversions,
    },
    qrSummary: {
      totalScans,
      uniqueSites: uniqueSiteCount,
      avgScansPerDay: Math.round((totalScans / daysDiff) * 10) / 10,
    },
    sitePerformance: [],
  }
}

export async function getReportDataForType(
  reportType: ReportType,
  municipalityId: string,
  filters: MTOReportFilters,
) {
  switch (reportType) {
    case "tourism_trend":
      return getTourismTrendData(municipalityId, filters)
    case "heritage_inventory":
      return getHeritageInventoryData(municipalityId)
    case "visitor_statistics":
      return getVisitorStatisticsData(municipalityId, filters)
    case "recommendation_qr":
      return getRecommendationQRData(municipalityId, filters)
    default:
      throw new Error(`Unknown report type: ${reportType}`)
  }
}

export async function saveGeneratedReport(
  reportType: ReportType,
  reportTitle: string,
  filters: MTOReportFilters,
): Promise<GeneratedReport> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const municipalityId = await resolveMunicipalityId()

  const { data, error } = await supabase
    .from("generated_reports")
    .insert({
      user_id: user.id,
      municipality_id: municipalityId,
      report_type: reportType,
      report_title: reportTitle,
      filters: filters as unknown as Record<string, unknown>,
    })
    .select("*")
    .single()

  if (error) throw new Error(`Failed to save report: ${error.message}`)

  return {
    id: data.id as string,
    userId: data.user_id as string,
    municipalityId: data.municipality_id as string,
    reportType: data.report_type as ReportType,
    reportTitle: data.report_title as string,
    filters: data.filters as unknown as MTOReportFilters,
    generatedAt: data.generated_at as string,
  }
}

export async function getGeneratedReports(): Promise<GeneratedReport[]> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const municipalityId = await resolveMunicipalityId()

  const { data, error } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("user_id", user.id)
    .eq("municipality_id", municipalityId)
    .order("generated_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    municipalityId: row.municipality_id as string,
    reportType: row.report_type as ReportType,
    reportTitle: row.report_title as string,
    filters: row.filters as unknown as MTOReportFilters,
    generatedAt: row.generated_at as string,
  }))
}

export async function deleteGeneratedReport(reportId: string): Promise<void> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("generated_reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", user.id)

  if (error) throw new Error(`Failed to delete report: ${error.message}`)
}

export { resolveMunicipalityId }
