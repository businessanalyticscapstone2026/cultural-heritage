import type { RecommendationResult } from "@/types/recommendation"

/** Site card used across home sections (featured, trending, recommended). */
export interface HomeSiteCard {
  id: string
  siteName: string
  shortDescription: string | null
  yearEstablished: string | null
  averageRating: number | null
  reviewCount: number | null
  municipalityName: string | null
  categoryId: string | null
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  imageUrl: string | null
  /** Engagement metric for trending (visits, clicks, or reviews depending on source). */
  metricValue?: number
  metricLabel?: string
}

export interface HomeCategoryTile {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  imageUrl: string | null
  siteCount: number
}

export interface HomeMapPin {
  id: string
  name: string
  categoryName: string | null
  categoryColor: string | null
  latitude: number
  longitude: number
}

export interface HomeAtlasStats {
  heritageSiteCount: number
  municipalityCount: number
  publishedReviewCount: number
}

export interface HomeTestimonial {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewerName: string
  siteId: string
  siteName: string
}

export type TrendingSource =
  | "visits"
  | "recommendation_clicks"
  | "combined_engagement"
  | "most_reviewed"

/** An event or announcement shown in the "What's happening in the district" section. */
export interface HomeAnnouncement {
  id: string
  title: string
  body: string | null
  /** Category label drives the pill (e.g. Festival, Event, Announcement). */
  category: string | null
  imageUrl: string | null
  /** Optional external detail target for the "Learn more" action. */
  linkUrl: string | null
  /** ISO date (YYYY-MM-DD). */
  eventDate: string | null
  municipalityName: string | null
}

export interface HomePagePayload {
  featuredSites: HomeSiteCard[]
  /** CHT-092: events & announcements for the "What's happening" section (0–3, with curated fallback). */
  announcements: HomeAnnouncement[]
  categories: HomeCategoryTile[]
  trendingSites: HomeSiteCard[]
  trendingSource: TrendingSource
  mapPins: HomeMapPin[]
  atlasStats: HomeAtlasStats
  recommendedSites: HomeSiteCard[]
  recommendedResults: RecommendationResult[]
  testimonials: HomeTestimonial[]
  /** Optional hero background from featured/published site media or district asset. */
  heroImageUrl: string | null
  /** Personalized greeting name (first name from tourist_profiles). */
  userName?: string
  /** Nearby sites based on user's home coordinates. */
  nearbySites: HomeSiteCard[]
  /** Recently viewed sites from recommendation click history. */
  recentlyViewedSites: HomeSiteCard[]
}

/** @deprecated Kept for older shared components; prefer HomePagePayload. */
export interface FeaturedMunicipality {
  id: string
  name: string
  imageUrl: string | null
  siteCount: number
}

/** @deprecated Prefer HomeMapPin. */
export interface HomeMapSite {
  id: string
  name: string
  categoryName: string | null
  latitude: number
  longitude: number
}

/** @deprecated Prefer HomeCategoryTile. */
export interface HomeCategory {
  id: string
  name: string
  description?: string | null
  icon: string | null
  color: string | null
}

/** @deprecated Prefer HomeSiteCard. */
export interface HomeSite {
  id: string
  siteName: string
  shortDescription: string | null
  yearEstablished: string | null
  averageRating: number | null
  reviewCount: number | null
  municipalityName: string | null
  categoryName: string | null
}

export interface HomeStats {
  heritageSiteCount: number
  municipalityCount: number
  visitorCount: number
  positiveReviewPercent: number
}

export interface TopSite {
  id: string
  siteName: string
  categoryName: string | null
  yearEstablished: string | null
  imageUrl: string | null
  municipalityName: string | null
}

export interface HomePageData {
  featuredSite: {
    id: string
    siteName: string
    shortDescription: string | null
    heroImage: string | null
  } | null
  featuredMunicipalities: FeaturedMunicipality[]
  categories: HomeCategory[]
  mapSites: HomeMapSite[]
  stats: HomeStats
  topSites: TopSite[]
}
