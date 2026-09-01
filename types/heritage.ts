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
  referenceLinks?: HeritageSiteReferenceLink[]
  matchScore?: number
  averageRating: number
  reviewCount: number
}

export interface HeritageSiteTag {
  id: string
  siteId: string
  tag: string
}

export interface HeritageSiteReferenceLink {
  id: string
  siteId?: string
  url: string
  label: string | null
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
  sortOrder: number
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
  imageUrl: string | null
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

export type ChangeType = "created" | "updated" | "status_changed"

export interface HeritageSiteVersion {
  id: string
  heritageSiteId: string
  snapshot: Record<string, unknown>
  changedBy: string | null
  changeType: ChangeType
  createdAt: string
}

export type BackupType = "full" | "custom"

export interface HeritageBackup {
  id: string
  backupName: string | null
  type: BackupType | null
  sizeBytes: number | null
  recordsCount: number | null
  createdBy: string | null
  status: string | null
  fileUrl: string | null
  createdAt: string
}

export type ReviewStatus = "submitted" | "approved" | "rejected" | "archived"

export interface GovernanceReview {
  id: string
  heritageSiteId: string
  heritageSiteVersionId: string
  status: ReviewStatus
  submittedBy: string
  submittedAt: string
  reviewedBy: string | null
  reviewedAt: string | null
  reviewerComment: string | null
  createdAt: string
  updatedAt: string
}

export interface GovernanceReviewWithSite extends GovernanceReview {
  siteName: string
  municipalityName: string | null
  categoryName: string | null
  submittedByName: string
  reviewedByName: string | null
  snapshot: Record<string, unknown>
  daysPending: number
}
