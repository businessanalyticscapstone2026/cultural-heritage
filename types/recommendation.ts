import type { HeritageSite } from "./heritage"

export interface RecommendationResult {
  site: HeritageSite
  score: number
  reasons: string[]
}

export interface UserPreferences {
  categories: string[]
  municipalities: string[]
  maxDistance?: number
}

export interface RecommendationWeights {
  categoryMatch: number
  historicalSignificance: number
  accessibility: number
  distance: number
  popularity: number
}
