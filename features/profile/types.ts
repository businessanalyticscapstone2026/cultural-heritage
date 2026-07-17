export interface ProfileData {
  firstName: string | null
  lastName: string | null
  email: string | null
  homeLatitude: number | null
  homeLongitude: number | null
  interests: string[]
  preferredCategoryIds: string[]
  travelStyle: string | null
  groupType: string | null
  accessibilityNeeds: string[]
  onboarded: boolean
}

export interface ProfileCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
}

export interface RecommendationHistoryItem {
  id: string
  siteId: string
  siteName: string
  municipalityName: string | null
  categoryName: string | null
  imageUrl: string | null
  matchScore: number
  reasons: string[]
  method: string | null
  wasClicked: boolean
  clickedAt: string | null
  bookmarked: boolean
  createdAt: string
}

export type ProfileTab = "profile" | "preferences" | "saved" | "history" | "account"
