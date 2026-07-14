export interface MTOMetric {
  label: string
  value: number
  changePercent: number
  changeDirection: "up" | "down" | "stable"
  icon: string
  description: string
  unit?: string
}

export interface VisitorTrendPoint {
  period: string
  visitors: number
}

export type TrendGranularity = "daily" | "weekly" | "monthly"

export interface AttractionVisit {
  categoryName: string
  visits: number
  percentage: number
  color: string
}

export interface AgeGroupBreakdown {
  ageGroup: string
  count: number
  percentage: number
}

export interface VisitorTypeBreakdown {
  type: string
  count: number
  percentage: number
  color: string
}

export interface TopVisitedSite {
  siteId: string
  siteName: string
  categoryName: string
  visits: number
  percentage: number
}

export interface RecommendationFunnel {
  generated: number
  clicked: number
  routePlans: number
  conversions: number
}

export interface MTOAnalyticsFilters {
  dateFrom: string
  dateTo: string
  categoryId: string | null
}
