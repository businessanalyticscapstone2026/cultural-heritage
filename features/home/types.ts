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

/** Editorial tourism-highlight site with narrative significance fields. */
export interface HomeEditorialHighlight {
  id: string
  siteName: string
  shortDescription: string | null
  /** Preferred narrative body (historical or cultural significance). */
  narrative: string
  narrativeKind: "historical" | "cultural"
  yearEstablished: string | null
  municipalityName: string | null
  categoryName: string | null
  categoryColor: string | null
  imageUrl: string | null
  latitude: number | null
  longitude: number | null
}

export interface HomePagePayload {
  featuredSites: HomeSiteCard[]
  /** CR-CHTS-002: narrative-rich sites for the tourism highlights editorial section (0–2). */
  editorialHighlights: HomeEditorialHighlight[]
  categories: HomeCategoryTile[]
  trendingSites: HomeSiteCard[]
  trendingSource: TrendingSource
  mapPins: HomeMapPin[]
  atlasStats: HomeAtlasStats
  /**
   * CR-CHTS-005: replace this list with the personalized recommendation engine.
   * Currently top-rated published public sites (placeholder).
   */
  recommendedSites: HomeSiteCard[]
  testimonials: HomeTestimonial[]
  /** Optional hero background from featured/published site media or district asset. */
  heroImageUrl: string | null
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
