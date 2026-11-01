import { describe, expect, test } from "bun:test"
import {
  computeEngagementScore,
  computeGlobalMeanStars,
  computeSatisfactionIndex,
  computeSiteMetrics,
  evaluateSiteAlerts,
  isInBottomEngagementPercentile,
  reviewStars,
  starsToIndex,
} from "./scoring"
import { buildReviewInsights, toDashboardInsights } from "./build-insights"
import { REVIEW_INSIGHTS_CONFIG } from "../config"
import { UNDER_PROMOTION_PERCENTILE_THRESHOLD } from "@/features/recommendation-monitoring/utils"
import type { ReviewSignal, SiteReviewInput, SiteReviewMetrics } from "../types"

const NOW = new Date("2026-11-01T00:00:00Z")
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString()

const ALL_KEYS = Object.keys(REVIEW_INSIGHTS_CONFIG.satisfaction.criterionWeights)
const criteria = (score: number, overrides: Record<string, number> = {}) => ({
  ...Object.fromEntries(ALL_KEYS.map((k) => [k, score])),
  ...overrides,
})

function review(overrides: Partial<ReviewSignal> = {}): ReviewSignal {
  return {
    rating: 4,
    criteria: criteria(4),
    tagKeys: [],
    hasMedia: false,
    commentLength: 0,
    createdAt: daysAgo(1),
    ...overrides,
  }
}

function site(id: string, reviews: ReviewSignal[]): SiteReviewInput {
  return { siteId: id, siteName: `Site ${id}`, municipalityId: "m1", reviews }
}

describe("config", () => {
  test("engagement weights sum to 1 and promotion reuses the monitoring percentile", () => {
    const sum = Object.values(REVIEW_INSIGHTS_CONFIG.engagement.weights).reduce((s, v) => s + v, 0)
    expect(sum).toBeCloseTo(1, 10)
    expect(REVIEW_INSIGHTS_CONFIG.alerts.promotion.engagementPercentile).toBe(UNDER_PROMOTION_PERCENTILE_THRESHOLD)
  })
})

describe("computeSatisfactionIndex", () => {
  test("maps stars to 0-100", () => {
    expect(starsToIndex(1)).toBe(0)
    expect(starsToIndex(5)).toBe(100)
    expect(starsToIndex(3)).toBe(50)
  })

  test("returns null without reviews", () => {
    expect(computeSatisfactionIndex(site("a", []), 3.5, NOW)).toBeNull()
  })

  test("Bayesian shrinkage keeps a single 5-star review from swinging the index", () => {
    const one = computeSatisfactionIndex(site("a", [review({ rating: 5, criteria: criteria(5) })]), 3, NOW)
    // (1*5 + 5*3) / 6 = 3.333 stars -> 58.3
    expect(one).toBe(58.3)
    const many = computeSatisfactionIndex(
      site("a", Array.from({ length: 50 }, () => review({ rating: 5, criteria: criteria(5) }))),
      3,
      NOW
    )
    expect(many as number).toBeGreaterThan(95)
  })

  test("weights criteria by config and counts legacy reviews via their rating", () => {
    const legacy = review({ rating: 2, criteria: {} })
    expect(reviewStars(legacy)).toBe(2)
    const mixed = computeSatisfactionIndex(site("a", [legacy, review({ criteria: criteria(4) })]), 3, NOW)
    // per-criterion means are 3 for every criterion -> 3 stars; shrunk toward 3 -> 50
    expect(mixed).toBe(50)
  })

  test("ignores reviews outside the satisfaction window", () => {
    const old = review({ rating: 1, criteria: criteria(1), createdAt: daysAgo(400) })
    expect(computeSatisfactionIndex(site("a", [old]), 3, NOW)).toBeNull()
  })

  test("global mean falls back when there is no data", () => {
    expect(computeGlobalMeanStars([])).toBe(REVIEW_INSIGHTS_CONFIG.satisfaction.fallbackGlobalMean)
    expect(computeGlobalMeanStars([review({ criteria: criteria(2) }), review({ criteria: criteria(4) })])).toBe(3)
  })
})

describe("computeEngagementScore", () => {
  test("is 0 with no recent reviews", () => {
    expect(computeEngagementScore(site("a", [review({ createdAt: daysAgo(120) })]), NOW)).toBe(0)
  })

  test("rewards volume, media, tags, text and recency", () => {
    const plain = computeEngagementScore(site("a", [review()]), NOW)
    const rich = computeEngagementScore(
      site("a", [review({ hasMedia: true, tagKeys: ["crowded"], commentLength: 200 })]),
      NOW
    )
    expect(rich).toBeGreaterThan(plain)
    const busy = computeEngagementScore(site("a", Array.from({ length: 20 }, () => review())), NOW)
    expect(busy).toBeGreaterThan(plain)
  })

  test("decays with time since the latest review and saturates at 100", () => {
    const fresh = computeEngagementScore(site("a", [review({ createdAt: daysAgo(0) })]), NOW)
    const stale = computeEngagementScore(site("a", [review({ createdAt: daysAgo(60) })]), NOW)
    expect(stale).toBeLessThan(fresh)
    const max = computeEngagementScore(
      site("a", Array.from({ length: 60 }, () => review({ createdAt: daysAgo(0), hasMedia: true, tagKeys: ["x"], commentLength: 100 }))),
      NOW
    )
    expect(max).toBe(100)
  })
})

describe("evaluateSiteAlerts", () => {
  const metricsFor = (s: SiteReviewInput) => computeSiteMetrics(s, 3.5, NOW)

  test("maintenance alert when site_condition mean <= 3 with enough reviews", () => {
    const s = site("a", Array.from({ length: 5 }, () => review({ criteria: criteria(4, { site_condition: 2 }) })))
    const alerts = evaluateSiteAlerts(s, metricsFor(s), [metricsFor(s)], NOW)
    expect(alerts.map((a) => a.type)).toEqual(["maintenance"])
    expect(alerts[0].reasons[0]).toContain("Site condition")
  })

  test("maintenance alert on a high share of maintenance tags", () => {
    const reviews = [
      ...Array.from({ length: 2 }, () => review({ tagKeys: ["needs_repair"] })),
      ...Array.from({ length: 3 }, () => review()),
    ]
    const s = site("a", reviews)
    const alerts = evaluateSiteAlerts(s, metricsFor(s), [metricsFor(s)], NOW)
    expect(alerts[0]?.type).toBe("maintenance")
    expect(alerts[0].reasons.some((r) => r.includes("40%"))).toBe(true)
  })

  test("minimum-sample guard: 4 terrible reviews never alert", () => {
    const s = site("a", Array.from({ length: 4 }, () => review({ rating: 1, criteria: criteria(1), tagKeys: ["unsafe_area"] })))
    expect(evaluateSiteAlerts(s, metricsFor(s), [metricsFor(s)], NOW)).toEqual([])
  })

  test("legacy reviews never trigger criterion-based maintenance alerts", () => {
    const s = site("a", Array.from({ length: 6 }, () => review({ rating: 1, criteria: {} })))
    expect(evaluateSiteAlerts(s, metricsFor(s), [metricsFor(s)], NOW).filter((a) => a.type === "maintenance")).toEqual([])
  })

  test("promotion alert: high satisfaction but bottom engagement among peers", () => {
    // Loved site, but all reviews are old (low recency, outside 90-day window)
    const loved = site("loved", Array.from({ length: 30 }, () => review({ rating: 5, criteria: criteria(5), createdAt: daysAgo(200) })))
    const peers = ["p1", "p2", "p3", "p4"].map((id) =>
      site(id, Array.from({ length: 10 }, () => review({ hasMedia: true, commentLength: 100 })))
    )
    const all = [loved, ...peers]
    const metrics = all.map(metricsFor)
    const lovedMetrics = metrics[0]
    expect(lovedMetrics.satisfactionIndex as number).toBeGreaterThanOrEqual(80)
    const alerts = evaluateSiteAlerts(loved, lovedMetrics, metrics, NOW)
    expect(alerts.map((a) => a.type)).toEqual(["promotion"])
  })

  test("no promotion alert with too few peers or low satisfaction", () => {
    const loved = site("loved", Array.from({ length: 30 }, () => review({ rating: 5, criteria: criteria(5), createdAt: daysAgo(200) })))
    const m = metricsFor(loved)
    expect(evaluateSiteAlerts(loved, m, [m], NOW)).toEqual([])

    const meh = site("meh", Array.from({ length: 30 }, () => review({ rating: 3, criteria: criteria(3), createdAt: daysAgo(200) })))
    const peers = ["p1", "p2", "p3"].map((id) => site(id, [review()]))
    const metrics = [meh, ...peers].map(metricsFor)
    expect(evaluateSiteAlerts(meh, metrics[0], metrics, NOW)).toEqual([])
  })

  test("bottom-percentile uses ceil(n * p) with at least one site", () => {
    const mk = (id: string, engagementScore: number): SiteReviewMetrics => ({
      siteId: id, siteName: id, municipalityId: null, reviewCount: 10, recentReviewCount: 10, satisfactionIndex: 90, engagementScore,
    })
    const peers = [mk("a", 10), mk("b", 20), mk("c", 30), mk("d", 40), mk("e", 50), mk("f", 60)]
    expect(isInBottomEngagementPercentile(peers[0], peers, 0.2)).toBe(true)
    expect(isInBottomEngagementPercentile(peers[1], peers, 0.2)).toBe(true) // ceil(6*0.2)=2
    expect(isInBottomEngagementPercentile(peers[2], peers, 0.2)).toBe(false)
  })
})

describe("buildReviewInsights / toDashboardInsights", () => {
  test("aggregates sites, orders maintenance alerts first and maps to dashboard cards", () => {
    const broken = site("broken", Array.from({ length: 6 }, () => review({ criteria: criteria(4, { safety: 2 }) })))
    const quiet = site("quiet", [])
    const result = buildReviewInsights([broken, quiet], broken.reviews, NOW)
    expect(result.sites).toHaveLength(2)
    expect(result.sites[1].satisfactionIndex).toBeNull()
    expect(result.alerts[0].type).toBe("maintenance")
    expect(result.averageSatisfactionIndex).not.toBeNull()

    const cards = toDashboardInsights(result)
    expect(cards[0].id).toBe("review-satisfaction")
    expect(cards.some((c) => c.label === "Maintenance Alert" && c.value === "Site broken")).toBe(true)
  })

  test("no reviews anywhere yields no cards", () => {
    expect(toDashboardInsights(buildReviewInsights([site("a", [])], [], NOW))).toEqual([])
  })
})
