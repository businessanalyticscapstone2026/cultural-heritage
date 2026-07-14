export type RecommendationSource = "content_based" | "location_aware" | "weighted_hybrid"

export interface RecommendationMonitoringFilters {
  dateFrom: string
  dateTo: string
  categoryId: string | null
  siteId: string | null
}

export interface RecommendationFunnelMetrics {
  generated: number
  clicked: number
  bookmarked: number
  routePlans: number
  clickThroughRate: number
  conversionRate: number
}

export interface RecommendationSiteSummary {
  siteId: string
  siteName: string
  categoryName: string
  timesRecommended: number
  timesClicked: number
  timesBookmarked: number
  timesConverted: number
  clickThroughRate: number
  conversionRate: number
  averageScore: number
}

export interface UnderPromotedSite {
  siteId: string
  siteName: string
  categoryName: string
  timesRecommended: number
  timesClicked: number
  clickThroughRate: number
  percentileRank: number
  flagReason: string
}

export interface SiteRecommendationDetail {
  siteId: string
  siteName: string
  categoryName: string
  totalGenerated: number
  totalClicked: number
  totalBookmarked: number
  totalConverted: number
  clickThroughRate: number
  conversionRate: number
  averageScore: number
  sourceBreakdown: {
    source: RecommendationSource
    count: number
    percentage: number
  }[]
  dailyTrend: {
    date: string
    generated: number
    clicked: number
    converted: number
  }[]
}

export interface LogRecommendationEventPayload {
  siteId: string
  sessionId?: string
  touristId?: string
  score?: number
  source?: RecommendationSource
}

export interface RecommendationMonitoringSummary {
  funnel: RecommendationFunnelMetrics
  topPerformers: RecommendationSiteSummary[]
  underPromotedSites: UnderPromotedSite[]
  totalSites: number
  totalEvents: number
}
