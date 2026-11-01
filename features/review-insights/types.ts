/** One published review reduced to the signals the DSS needs (no identity). */
export interface ReviewSignal {
  rating: number
  /** criterion_key -> score; empty for legacy single-rating reviews */
  criteria: Record<string, number>
  tagKeys: string[]
  hasMedia: boolean
  commentLength: number
  createdAt: string
}

export interface SiteReviewInput {
  siteId: string
  siteName: string
  municipalityId: string | null
  /** Published reviews within the satisfaction window. */
  reviews: ReviewSignal[]
}

export type SiteAlertType = "maintenance" | "promotion"

export interface SiteAlert {
  type: SiteAlertType
  siteId: string
  siteName: string
  /** Human-readable explanations of why the alert fired. */
  reasons: string[]
}

export interface SiteReviewMetrics {
  siteId: string
  siteName: string
  municipalityId: string | null
  /** Reviews in the satisfaction window. */
  reviewCount: number
  /** Reviews in the recent (engagement/alert) window. */
  recentReviewCount: number
  /** 0-100, or null when the site has no reviews in the window. */
  satisfactionIndex: number | null
  /** 0-100 */
  engagementScore: number
}

export interface SiteReviewInsight extends SiteReviewMetrics {
  alerts: SiteAlert[]
}

export interface MunicipalityReviewInsights {
  sites: SiteReviewInsight[]
  alerts: SiteAlert[]
  /** Review-weighted mean satisfaction index across sites with reviews, or null. */
  averageSatisfactionIndex: number | null
  generatedAt: string
}
