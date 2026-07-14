export type ReportType =
  | "tourism_trend"
  | "heritage_inventory"
  | "visitor_statistics"
  | "recommendation_qr"

export interface ReportTypeDefinition {
  id: ReportType
  title: string
  description: string
  icon: string
  sections: ExportSection[]
}

export interface ExportSection {
  id: string
  label: string
}

export interface MTOReportFilters {
  dateFrom: string
  dateTo: string
  categoryId: string | null
}

export interface GeneratedReport {
  id: string
  userId: string
  municipalityId: string
  reportType: ReportType
  reportTitle: string
  filters: MTOReportFilters
  generatedAt: string
}

export interface TourismTrendReportData {
  summary: {
    totalVisitors: number
    totalSitesVisited: number
    avgRating: number
    totalRecommendations: number
  }
  visitorTrend: { period: string; visitors: number }[]
  visitsByAttraction: { categoryName: string; visits: number; percentage: number }[]
  demographics: {
    ageGroups: { ageGroup: string; count: number; percentage: number }[]
    visitorTypes: { type: string; count: number; percentage: number }[]
  }
}

export interface HeritageInventoryReportData {
  summary: {
    totalSites: number
    publishedCount: number
    draftCount: number
    categoryBreakdown: { categoryName: string; count: number }[]
  }
  sites: {
    id: string
    siteName: string
    categoryName: string | null
    municipalityName: string | null
    barangay: string | null
    publicationStatus: string
    createdAt: string
    latitude: number | null
    longitude: number | null
  }[]
}

export interface VisitorStatisticsReportData {
  summary: {
    totalVisitors: number
    localCount: number
    domesticCount: number
    internationalCount: number
  }
  visitorTypes: { type: string; count: number; percentage: number }[]
  topSites: {
    siteId: string
    siteName: string
    categoryName: string
    visits: number
    percentage: number
  }[]
}

export interface RecommendationQRReportData {
  funnel: {
    generated: number
    clicked: number
    routePlans: number
    conversions: number
  }
  qrSummary: {
    totalScans: number
    uniqueSites: number
    avgScansPerDay: number
  }
  sitePerformance: {
    siteId: string
    siteName: string
    timesRecommended: number
    timesClicked: number
    timesConverted: number
    clickRate: number
    convRate: number
  }[]
}
