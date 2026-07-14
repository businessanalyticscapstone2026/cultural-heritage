import type { RecommendationMonitoringFilters } from "./types"

export function parseRecommendationMonitoringFilters(
  params: Record<string, string | undefined>
): RecommendationMonitoringFilters {
  return {
    dateFrom: params.date_from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dateTo: params.date_to ?? new Date().toISOString().slice(0, 10),
    categoryId: params.category_id ?? null,
    siteId: params.site_id ?? null,
  }
}

export const RECOMMENDATION_SOURCE_LABELS: Record<string, string> = {
  content_based: "Content-Based",
  location_aware: "Location-Aware",
  weighted_hybrid: "Weighted Hybrid",
}

export const UNDER_PROMOTION_PERCENTILE_THRESHOLD = 0.2

export const RECOMMENDATION_MONITORING_DEFAULT_PAGE_SIZE = 20
