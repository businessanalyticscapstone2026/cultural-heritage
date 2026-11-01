import { REVIEW_INSIGHTS_CONFIG, type ReviewInsightsConfig } from "../config"
import type {
  ReviewSignal,
  SiteAlert,
  SiteReviewInput,
  SiteReviewMetrics,
} from "../types"
import { getCriterionLabel } from "@/features/reviews/utils/review-criteria"

/**
 * Pure DSS scoring for review insights. No I/O; every weight/threshold comes
 * from config.ts (injectable for tests). Formulas: docs/review-insights.md.
 */

const DAY_MS = 24 * 60 * 60 * 1000

function daysBetween(fromIso: string, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(fromIso).getTime()) / DAY_MS)
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function filterRecent(
  reviews: readonly ReviewSignal[],
  now: Date,
  windowDays: number
): ReviewSignal[] {
  return reviews.filter((r) => daysBetween(r.createdAt, now) <= windowDays)
}

/** Stars (1-5) to a 0-100 scale. */
export function starsToIndex(stars: number): number {
  return ((stars - 1) / 4) * 100
}

/**
 * Per-criterion mean. Legacy reviews without criteria contribute their overall
 * rating to every criterion (fallback); rich reviews contribute the actual score.
 */
export function criterionMeansWithFallback(
  reviews: readonly ReviewSignal[],
  criterionKeys: readonly string[]
): Record<string, number | null> {
  const out: Record<string, number | null> = {}
  for (const key of criterionKeys) {
    const values = reviews.map((r) =>
      Object.keys(r.criteria).length === 0 ? r.rating : (r.criteria[key] ?? r.rating)
    )
    out[key] = values.length === 0 ? null : values.reduce((s, v) => s + v, 0) / values.length
  }
  return out
}

/** Weighted mean (1-5 stars) of a single review's criteria, or its rating for legacy reviews. */
export function reviewStars(
  review: ReviewSignal,
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): number {
  const weights = config.satisfaction.criterionWeights as Record<string, number>
  let weighted = 0
  let total = 0
  for (const [key, weight] of Object.entries(weights)) {
    const score = review.criteria[key]
    if (typeof score === "number") {
      weighted += score * weight
      total += weight
    }
  }
  return total > 0 ? weighted / total : review.rating
}

/** Mean review stars over a set of reviews (the prior for shrinkage), or the fallback. */
export function computeGlobalMeanStars(
  reviews: readonly ReviewSignal[],
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): number {
  if (reviews.length === 0) return config.satisfaction.fallbackGlobalMean
  return reviews.reduce((s, r) => s + reviewStars(r, config), 0) / reviews.length
}

/**
 * Satisfaction index (0-100): weighted mean of per-criterion means (legacy
 * reviews count via their rating), shrunk toward the global mean with a
 * Bayesian prior of `priorWeight` virtual reviews. Null with no reviews.
 */
export function computeSatisfactionIndex(
  site: Pick<SiteReviewInput, "reviews">,
  globalMeanStars: number,
  now: Date = new Date(),
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): number | null {
  const reviews = filterRecent(site.reviews, now, config.satisfactionWindowDays)
  const n = reviews.length
  if (n === 0) return null

  const weights = config.satisfaction.criterionWeights as Record<string, number>
  const keys = Object.keys(weights)
  const means = criterionMeansWithFallback(reviews, keys)
  let weighted = 0
  let total = 0
  for (const key of keys) {
    const mean = means[key]
    if (mean != null) {
      weighted += mean * weights[key]
      total += weights[key]
    }
  }
  const siteMean = weighted / total
  const m = config.satisfaction.priorWeight
  const shrunk = (n * siteMean + m * globalMeanStars) / (n + m)
  return round1(starsToIndex(shrunk))
}

/**
 * Engagement score (0-100) over the recent window: log-scaled volume, share of
 * reviews with media / tags / substantial text, and recency decay of the most
 * recent review.
 */
export function computeEngagementScore(
  site: Pick<SiteReviewInput, "reviews">,
  now: Date = new Date(),
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): number {
  const recent = filterRecent(site.reviews, now, config.recentWindowDays)
  const n = recent.length
  if (n === 0) return 0

  const e = config.engagement
  const volume = Math.min(1, Math.log1p(n) / Math.log1p(e.volumeSaturationCount))
  const share = (predicate: (r: ReviewSignal) => boolean) => recent.filter(predicate).length / n
  const mediaShare = share((r) => r.hasMedia)
  const tagShare = share((r) => r.tagKeys.length > 0)
  const textShare = share((r) => r.commentLength >= e.minTextLength)

  const newestAgeDays = Math.min(...recent.map((r) => daysBetween(r.createdAt, now)))
  const recency = Math.pow(0.5, newestAgeDays / e.recencyHalfLifeDays)

  const w = e.weights
  const score =
    w.volume * volume +
    w.mediaShare * mediaShare +
    w.tagShare * tagShare +
    w.textShare * textShare +
    w.recency * recency
  return round1(score * 100)
}

/** Metrics for one site, given the global prior. */
export function computeSiteMetrics(
  site: SiteReviewInput,
  globalMeanStars: number,
  now: Date = new Date(),
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): SiteReviewMetrics {
  return {
    siteId: site.siteId,
    siteName: site.siteName,
    municipalityId: site.municipalityId,
    reviewCount: filterRecent(site.reviews, now, config.satisfactionWindowDays).length,
    recentReviewCount: filterRecent(site.reviews, now, config.recentWindowDays).length,
    satisfactionIndex: computeSatisfactionIndex(site, globalMeanStars, now, config),
    engagementScore: computeEngagementScore(site, now, config),
  }
}

/** Maintenance alert reasons from recent reviews (actual criterion ratings only, no fallback). */
function maintenanceReasons(
  recent: readonly ReviewSignal[],
  config: ReviewInsightsConfig
): string[] {
  const { minSampleSize, maintenance } = config.alerts
  const reasons: string[] = []

  for (const key of maintenance.criteria) {
    const scores = recent.map((r) => r.criteria[key]).filter((s): s is number => typeof s === "number")
    if (scores.length < minSampleSize) continue
    const mean = scores.reduce((s, v) => s + v, 0) / scores.length
    if (mean <= maintenance.criterionMeanThreshold) {
      reasons.push(
        `${getCriterionLabel(key)} averages ${round1(mean)}/5 across ${scores.length} recent reviews`
      )
    }
  }

  const tagSet = new Set<string>(maintenance.tagKeys)
  const tagged = recent.filter((r) => r.tagKeys.some((t) => tagSet.has(t))).length
  const tagShare = tagged / recent.length
  if (tagShare >= maintenance.negativeTagShareThreshold) {
    reasons.push(
      `${Math.round(tagShare * 100)}% of recent reviews report maintenance issues (${tagged} of ${recent.length})`
    )
  }
  return reasons
}

/**
 * Whether `site` falls in the bottom `percentile` of `peers` by engagement.
 * Uses the same "lowest ceil(n * p) entries" rule as recommendation monitoring.
 */
export function isInBottomEngagementPercentile(
  site: SiteReviewMetrics,
  peers: readonly SiteReviewMetrics[],
  percentile: number
): boolean {
  if (peers.length === 0) return false
  const sorted = [...peers].sort(
    (a, b) => a.engagementScore - b.engagementScore || a.siteId.localeCompare(b.siteId)
  )
  const cutoff = Math.max(1, Math.ceil(sorted.length * percentile))
  return sorted.slice(0, cutoff).some((p) => p.siteId === site.siteId)
}

/**
 * Maintenance and promotion alerts for one site. `peers` should include the
 * site itself (the comparison set, e.g. sites in the same municipality).
 * A minimum sample guard prevents alerts on tiny samples.
 */
export function evaluateSiteAlerts(
  site: SiteReviewInput,
  metrics: SiteReviewMetrics,
  peers: readonly SiteReviewMetrics[],
  now: Date = new Date(),
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): SiteAlert[] {
  const alerts: SiteAlert[] = []
  const { minSampleSize, promotion } = config.alerts
  const recent = filterRecent(site.reviews, now, config.recentWindowDays)

  if (recent.length >= minSampleSize) {
    const reasons = maintenanceReasons(recent, config)
    if (reasons.length > 0) {
      alerts.push({ type: "maintenance", siteId: site.siteId, siteName: site.siteName, reasons })
    }
  }

  if (
    metrics.satisfactionIndex != null &&
    metrics.reviewCount >= minSampleSize &&
    metrics.satisfactionIndex >= promotion.minSatisfactionIndex &&
    peers.length >= promotion.minPeerCount &&
    isInBottomEngagementPercentile(metrics, peers, promotion.engagementPercentile)
  ) {
    alerts.push({
      type: "promotion",
      siteId: site.siteId,
      siteName: site.siteName,
      reasons: [
        `Satisfaction index ${metrics.satisfactionIndex}/100 from ${metrics.reviewCount} reviews`,
        `Engagement ${metrics.engagementScore}/100 is in the bottom ${Math.round(promotion.engagementPercentile * 100)}% of ${peers.length} peer sites`,
      ],
    })
  }

  return alerts
}
