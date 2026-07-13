export interface ProvinceMetric {
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

export interface MunicipalityVisit {
  municipalityId: string
  municipalityName: string
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

export interface CategoryVisit {
  categoryId: string
  categoryName: string
  visits: number
  percentage: number
  color: string
}

export interface TopVisitedSite {
  siteId: string
  siteName: string
  municipalityName: string
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

export interface AnalyticsFilters {
  dateFrom: string
  dateTo: string
  municipalityId: string | null
  categoryId: string | null
}
