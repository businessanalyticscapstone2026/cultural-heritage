import { UNDER_PROMOTION_PERCENTILE_THRESHOLD } from "@/features/recommendation-monitoring/utils"
import type { ReviewCriterionKey, ReviewTagKey } from "@/features/reviews/constants"
import { MAINTENANCE_TAG_KEYS } from "@/features/reviews/constants"

/**
 * Review-insights (DSS) configuration — the ONLY place weights and thresholds
 * live. Documented in docs/review-insights.md.
 *
 * STATUS: defaults chosen for CHT-135 (the ticket gives no formulas).
 * Pending product sign-off; tune here without touching the scoring code.
 */
export const REVIEW_INSIGHTS_CONFIG = {
  /** Reviews older than this are ignored by the satisfaction index. */
  satisfactionWindowDays: 365,
  /** Window for engagement score and alerts ("recent" activity). */
  recentWindowDays: 90,

  satisfaction: {
    /**
     * Relative importance of each criterion in the satisfaction index.
     * Normalized at runtime, so they need not sum to 1.
     */
    criterionWeights: {
      site_condition: 0.2,
      cultural_value: 0.2,
      accessibility: 0.15,
      guides_information: 0.15,
      safety: 0.15,
      value_for_money: 0.15,
    } satisfies Record<ReviewCriterionKey, number>,
    /** Bayesian prior strength, in "virtual reviews" at the global mean. */
    priorWeight: 5,
    /** Prior mean (1-5 stars) used when there are no reviews anywhere yet. */
    fallbackGlobalMean: 3.5,
  },

  engagement: {
    /** Component weights; they sum to 1 so the score is 0-100. */
    weights: {
      volume: 0.4,
      mediaShare: 0.15,
      tagShare: 0.1,
      textShare: 0.15,
      recency: 0.2,
    },
    /** Recent-review count at which the log-scaled volume component saturates (=1). */
    volumeSaturationCount: 50,
    /** A comment counts as "written feedback" at or above this many characters. */
    minTextLength: 40,
    /** Recency component halves every N days since the most recent review. */
    recencyHalfLifeDays: 30,
  },

  alerts: {
    /** Minimum reviews in the recent window before any alert can fire. */
    minSampleSize: 5,
    maintenance: {
      /** Criteria whose low mean signals a maintenance problem. */
      criteria: ["site_condition", "safety"] as readonly ReviewCriterionKey[],
      /** Alert when a maintenance criterion's mean is at or below this. */
      criterionMeanThreshold: 3.0,
      /** Tags that count as maintenance complaints. */
      tagKeys: MAINTENANCE_TAG_KEYS as readonly ReviewTagKey[],
      /** Alert when at least this share of recent reviews carries a maintenance tag. */
      negativeTagShareThreshold: 0.3,
    },
    promotion: {
      /** Satisfaction index at or above which a site is worth promoting. */
      minSatisfactionIndex: 80,
      /** Bottom share of peers (by engagement) considered under-engaged. Reused from recommendation monitoring. */
      engagementPercentile: UNDER_PROMOTION_PERCENTILE_THRESHOLD,
      /** Percentile ranking is meaningless with very few peers. */
      minPeerCount: 3,
    },
  },

  dashboard: {
    /** Max alert cards shown on the MTO dashboard insights strip. */
    maxAlertInsights: 4,
  },
} as const

export type ReviewInsightsConfig = typeof REVIEW_INSIGHTS_CONFIG
