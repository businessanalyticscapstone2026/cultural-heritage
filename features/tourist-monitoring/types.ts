export type MonitoringActivityType = "visit" | "qr_scan" | "recommendation_click" | "bookmark" | "review"

export interface MonitoringFilters {
  dateFrom: string
  dateTo: string
  siteId: string | null
  categoryId: string | null
  activityType: MonitoringActivityType | null
}

export interface MonitoringMetric {
  label: string
  value: number
  changePercent: number
  changeDirection: "up" | "down" | "stable"
  icon: string
  description: string
  drillDownType: MonitoringActivityType | "all"
}

export interface MonitoringSummary {
  metrics: MonitoringMetric[]
  totalActivities: number
}

export interface ActivityLogEntry {
  id: string
  type: MonitoringActivityType
  siteId: string
  siteName: string
  visitorType: string | null
  description: string
  timestamp: string
}

export interface ActivityLogResult {
  items: ActivityLogEntry[]
  total: number
  page: number
  pageSize: number
}

export interface SitePopularity {
  siteId: string
  siteName: string
  categoryName: string
  visits: number
  percentage: number
}

export interface RecommendationPerf {
  siteId: string
  siteName: string
  timesRecommended: number
  timesClicked: number
  timesConverted: number
  clickRate: number
  convRate: number
}

export interface UnderPromotedSite {
  siteId: string
  siteName: string
  categoryName: string
  visits: number
  recommendationCount: number
}

export interface MonitoringSiteOption {
  id: string
  name: string
}

export interface TouristMonitoringBundle {
  summary: MonitoringSummary
  underPromoted: UnderPromotedSite[]
  recommendationPerf: RecommendationPerf[]
  popularity: SitePopularity[]
  recentActivity: ActivityLogResult
}
