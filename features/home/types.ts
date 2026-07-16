export interface FeaturedMunicipality {
  id: string
  name: string
  imageUrl: string | null
  siteCount: number
}

export interface HomeMapSite {
  id: string
  name: string
  categoryName: string | null
  latitude: number
  longitude: number
}

export interface HomeCategory {
  id: string
  name: string
  description?: string | null
  icon: string | null
  color: string | null
}

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
