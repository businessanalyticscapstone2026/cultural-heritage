import type { HeritageSite } from "./heritage"

export interface RecommendationResult {
  site: HeritageSite
  score: number
  matchPercentage: number
  reasons: string[]
}

export interface UserPreferences {
  interests: string[]
  preferredCategoryIds: string[]
  homeLatitude?: number | null
  homeLongitude?: number | null
  sessionId?: string | null
  limit?: number
  touristId?: string | null
}

export interface RecommendationWeights {
  categoryMatch: number
  historicalSignificance: number
  accessibility: number
  distance: number
  popularity: number
}

export interface RecommendationRecord {
  id: string
  touristId: string | null
  sessionId: string | null
  siteId: string
  score: number | null
  method: "content_based" | "location_aware" | "weighted_hybrid"
  generatedAt: string
  wasClicked: boolean
  clickedAt: string | null
  ledToRoute: boolean
  municipalityId: string
  bookmarked: boolean
  bookmarkedAt: string | null
}

export interface RecommendationRequest {
  sessionId?: string
  latitude?: number
  longitude?: number
  limit?: number
}

export interface SiteScoreBreakdown {
  siteId: string
  categoryMatch: number
  tagInterestScore: number
  accessibilityScore: number
  locationScore: number
  popularityScore: number
  finalScore: number
  matchPercentage: number
  distanceKm: number | null
  reasons: string[]
}
