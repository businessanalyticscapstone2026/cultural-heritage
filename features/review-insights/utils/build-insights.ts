import { REVIEW_INSIGHTS_CONFIG, type ReviewInsightsConfig } from "../config"
import type {
  MunicipalityReviewInsights,
  ReviewSignal,
  SiteAlert,
  SiteReviewInput,
} from "../types"
import type { DashboardInsight } from "@/types/mto-dashboard"
import { computeGlobalMeanStars, computeSiteMetrics, evaluateSiteAlerts, filterRecent } from "./scoring"

/**
 * Compute insights for a peer group of sites (e.g. one municipality).
 * `priorReviews` is the global review population used as the Bayesian prior
 * (all published reviews in the satisfaction window, any municipality).
 */
export function buildReviewInsights(
  sites: readonly SiteReviewInput[],
  priorReviews: readonly ReviewSignal[],
  now: Date = new Date(),
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): MunicipalityReviewInsights {
  const globalMean = computeGlobalMeanStars(
    filterRecent(priorReviews, now, config.satisfactionWindowDays),
    config
  )
  const metrics = sites.map((site) => computeSiteMetrics(site, globalMean, now, config))

  const insights = sites.map((site, i) => ({
    ...metrics[i],
    alerts: evaluateSiteAlerts(site, metrics[i], metrics, now, config),
  }))

  const rated = metrics.filter((m) => m.satisfactionIndex != null && m.reviewCount > 0)
  const totalReviews = rated.reduce((s, m) => s + m.reviewCount, 0)
  const averageSatisfactionIndex =
    totalReviews === 0
      ? null
      : Math.round(
          (rated.reduce((s, m) => s + (m.satisfactionIndex as number) * m.reviewCount, 0) /
            totalReviews) *
            10
        ) / 10

  // Maintenance first (needs action), then promotion opportunities.
  const alerts: SiteAlert[] = insights
    .flatMap((s) => s.alerts)
    .sort((a, b) => (a.type === b.type ? a.siteName.localeCompare(b.siteName) : a.type === "maintenance" ? -1 : 1))

  return { sites: insights, alerts, averageSatisfactionIndex, generatedAt: now.toISOString() }
}

/** Map review insights onto MTO dashboard insight cards (derive-on-read, not persisted). */
export function toDashboardInsights(
  result: MunicipalityReviewInsights,
  config: ReviewInsightsConfig = REVIEW_INSIGHTS_CONFIG
): DashboardInsight[] {
  const cards: DashboardInsight[] = []

  if (result.averageSatisfactionIndex != null) {
    const index = result.averageSatisfactionIndex
    cards.push({
      id: "review-satisfaction",
      label: "Visitor Satisfaction",
      value: `${Math.round(index)}/100`,
      detail: `Review-based satisfaction index across ${result.sites.filter((s) => s.reviewCount > 0).length} reviewed site(s)`,
      tone: index >= config.alerts.promotion.minSatisfactionIndex ? "positive" : index < 50 ? "negative" : "neutral",
      icon: "Smile",
    })
  }

  for (const alert of result.alerts.slice(0, config.dashboard.maxAlertInsights)) {
    cards.push({
      id: `review-alert-${alert.type}-${alert.siteId}`,
      label: alert.type === "maintenance" ? "Maintenance Alert" : "Promotion Opportunity",
      value: alert.siteName,
      detail: alert.reasons.join(" · "),
      tone: alert.type === "maintenance" ? "negative" : "positive",
      icon: alert.type === "maintenance" ? "Wrench" : "Megaphone",
    })
  }

  return cards
}
