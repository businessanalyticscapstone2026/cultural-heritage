import { REVIEW_CRITERIA, type ReviewCriterionKey } from "../constants"
import type { ReviewCriterionScore } from "@/types/review"

/**
 * Overall 1-5 rating from criteria scores: rounded mean (half rounds up).
 * Mirrors round(avg(score)) in public.submit_review(), which is the
 * authoritative computation for the stored reviews.rating value.
 * Returns 0 when no criterion has been rated yet.
 */
export function deriveOverallRating(scores: readonly number[]): number {
  const rated = scores.filter((s) => Number.isFinite(s) && s >= 1 && s <= 5)
  if (rated.length === 0) return 0
  const mean = rated.reduce((sum, s) => sum + s, 0) / rated.length
  return Math.min(5, Math.max(1, Math.round(mean)))
}

/** Unrounded mean of rated criteria (one decimal), for display. */
export function averageCriteriaScore(scores: readonly number[]): number {
  const rated = scores.filter((s) => Number.isFinite(s) && s >= 1 && s <= 5)
  if (rated.length === 0) return 0
  return Math.round((rated.reduce((sum, s) => sum + s, 0) / rated.length) * 10) / 10
}

/** Empty criteria map for the form (0 = not yet rated). */
export function emptyCriteriaScores(): Record<ReviewCriterionKey, number> {
  return Object.fromEntries(REVIEW_CRITERIA.map((c) => [c.key, 0])) as Record<
    ReviewCriterionKey,
    number
  >
}

/** Criteria map for editing an existing review (missing criteria stay 0). */
export function criteriaScoresFromReview(
  criteria: readonly ReviewCriterionScore[]
): Record<ReviewCriterionKey, number> {
  const scores = emptyCriteriaScores()
  for (const c of criteria) {
    if (c.key in scores) scores[c.key as ReviewCriterionKey] = c.score
  }
  return scores
}

export function getCriterionLabel(key: string): string {
  return REVIEW_CRITERIA.find((c) => c.key === key)?.label ?? key
}
