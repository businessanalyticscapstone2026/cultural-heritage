export type PublicationStatus = "draft" | "published" | "archived"
export type Visibility = "public" | "private"
export type MediaType = "image" | "video" | "brochure" | "document"

export interface HeritageSite {
  id: string
  siteName: string
  alternativeName: string | null
  categoryId: string | null
  municipalityId: string | null
  barangay: string | null
  exactAddress: string | null
  shortDescription: string | null
  detailedDescription: string | null
  historicalPeriod: string | null
  yearEstablished: string | null
  architectBuilder: string | null
  architecturalStyle: string | null
  historicalSignificance: string | null
  culturalSignificance: string | null
  latitude: number | null
  longitude: number | null
  elevation: number | null
  geoAccuracy: string | null
  accessibilityInfo: string | null
  operatingHours: string | null
  entranceFee: string | null
  designation: string | null
  publicationStatus: PublicationStatus
  isFeatured: boolean
  visibility: Visibility
  createdBy: string | null
  createdAt: string
  updatedAt: string

  category: HeritageCategory | null
  municipalityName: string | null
  tags: HeritageSiteTag[]
  media: HeritageSiteMedia[]
  matchScore?: number
  averageRating: number
  reviewCount: number
}

export interface HeritageSiteTag {
  id: string
  siteId: string
  tag: string
}

export interface HeritageSiteMedia {
  id: string
  siteId: string
  mediaType: MediaType
  fileUrl: string
  fileName: string | null
  fileSizeBytes: number | null
  mimeType: string | null
  isPrimary: boolean
  caption: string | null
  uploadedBy: string | null
  createdAt: string
}

export interface HeritageCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  displayOrder: number | null
  status: "active" | "inactive"
}

export type TravelMode = "walking" | "driving"

export interface NearbySite {
  siteId: string
  siteName: string
  category: string | null
  distanceKm: number
  travelTimeMinutes: number | null
  thumbnail: string | null
  latitude: number
  longitude: number
  municipalityName: string | null
}

export interface SavedSite {
  siteId: string
  siteName: string
  municipalityName: string | null
  categoryName: string | null
  thumbnail: string | null
  savedAt: string
}
