/**
 * Shared Next.js cache tags for unstable_cache / revalidateTag.
 * Keep tag names stable — mutating actions depend on these exact strings.
 */
export const CACHE_TAGS = {
  dashboardKpis: "dashboard-kpis",
  dashboardSites: "dashboard-sites",
  dashboardCategories: "dashboard-categories",
  dashboardVisits: "dashboard-visits",
  dashboardRecommendations: "dashboard-recommendations",
  dashboardHealth: "dashboard-health",
  heritageSites: "heritage-sites",
  heritageCategories: "heritage-categories",
  municipalities: "municipalities",
  routes: "routes",
  analytics: "analytics",
  /** CHT-135 review-derived DSS insights (satisfaction, engagement, alerts) */
  reviewInsights: "review-insights",
  /** CHT-136 Taal portal API: public heritage-site payloads */
  portalHeritageSites: "portal-heritage-sites",
  /** CHT-136 Taal portal API: public review payloads */
  portalReviews: "portal-reviews",
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/** Seconds for dashboard / repository / analytics list caches */
export const CACHE_REVALIDATE_SECONDS = 60
