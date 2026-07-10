import type { RecommendationResult, UserPreferences } from "../types"

export async function getRecommendations(preferences: UserPreferences): Promise<RecommendationResult[]> {
  return []
}

export function calculateScore(site: unknown, preferences: UserPreferences): number {
  return 0
}

export function getWeightedScore(scores: Record<string, number>): number {
  return 0
}
