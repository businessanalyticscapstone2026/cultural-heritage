import type {
  ReviewCriterionScore,
  ReviewMedia,
  ReviewStatus,
  ReviewWithAuthor,
} from "@/types/review"

/**
 * Anonymity-safe mapping from database rows to browser-safe review shapes.
 *
 * Rules enforced here (and covered by review-mappers.test.ts):
 *   * tourist_id is never copied into the output; ownership is exposed only as
 *     the server-computed `isOwn` boolean.
 *   * When is_anonymous is true, author names are null even though the
 *     PostgREST join returned them.
 */

/** Explicit column list for review reads (never select("*")). */
export const REVIEW_COLUMNS = `
  id, tourist_id, site_id, rating, comment, status, is_anonymous, created_at, updated_at,
  tourist:tourist_profiles(first_name, last_name),
  criteria:review_criteria_ratings(criterion_key, score),
  tags:review_tags(tag_key),
  media:review_media(id, media_type, file_url, storage_path, file_name, file_size_bytes, mime_type, sort_order)
`

/** Columns for the global published feed (no media/criteria needed on cards). */
export const PUBLISHED_FEED_COLUMNS = `
  id, tourist_id, site_id, rating, comment, is_anonymous, created_at, updated_at,
  tourist:tourist_profiles(first_name, last_name),
  site:heritage_sites(site_name)
`

type Joined<T> = T | T[] | null | undefined

interface AuthorJoin {
  first_name: string | null
  last_name: string | null
}

export interface ReviewRow {
  id: string
  tourist_id: string | null
  site_id: string
  rating: number
  comment: string | null
  status: string
  is_anonymous: boolean | null
  created_at: string
  updated_at: string | null
  tourist?: Joined<AuthorJoin>
  criteria?: { criterion_key: string; score: number }[] | null
  tags?: { tag_key: string }[] | null
  media?:
    | {
        id: string
        media_type: string
        file_url: string
        storage_path: string
        file_name: string
        file_size_bytes: number
        mime_type: string
        sort_order: number
      }[]
    | null
}

export interface PublishedFeedRow {
  id: string
  tourist_id: string | null
  site_id: string
  rating: number
  comment: string | null
  is_anonymous: boolean | null
  created_at: string
  updated_at: string | null
  tourist?: Joined<AuthorJoin>
  site?: Joined<{ site_name: string }>
}

function unwrap<T>(value: Joined<T>): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

/** Author names, or nulls when the review is anonymous. */
export function resolveAuthorNames(
  isAnonymous: boolean,
  author: Joined<AuthorJoin>
): { authorFirstName: string | null; authorLastName: string | null } {
  if (isAnonymous) return { authorFirstName: null, authorLastName: null }
  const a = unwrap(author)
  return {
    authorFirstName: a?.first_name?.trim() || null,
    authorLastName: a?.last_name?.trim() || null,
  }
}

export function isOwnReview(touristId: string | null, viewerId: string | null): boolean {
  return viewerId != null && touristId != null && touristId === viewerId
}

function mapCriteria(rows: ReviewRow["criteria"]): ReviewCriterionScore[] {
  return (rows ?? [])
    .map((c) => ({ key: c.criterion_key, score: Number(c.score) }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

function mapMedia(rows: ReviewRow["media"]): ReviewMedia[] {
  return (rows ?? [])
    .map((m) => ({
      id: m.id,
      mediaType: m.media_type === "video" ? ("video" as const) : ("image" as const),
      fileUrl: m.file_url,
      storagePath: m.storage_path,
      fileName: m.file_name,
      fileSizeBytes: Number(m.file_size_bytes),
      mimeType: m.mime_type,
      sortOrder: Number(m.sort_order),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function mapReviewRow(row: ReviewRow, viewerId: string | null): ReviewWithAuthor {
  const isAnonymous = row.is_anonymous === true
  return {
    id: row.id,
    siteId: row.site_id,
    rating: row.rating,
    comment: row.comment ?? null,
    status: row.status as ReviewStatus,
    isAnonymous,
    isOwn: isOwnReview(row.tourist_id, viewerId),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    ...resolveAuthorNames(isAnonymous, row.tourist),
    criteria: mapCriteria(row.criteria),
    tags: (row.tags ?? []).map((t) => t.tag_key),
    media: mapMedia(row.media),
  }
}

export interface PublishedReviewItem {
  id: string
  siteId: string
  siteName: string
  rating: number
  comment: string | null
  isAnonymous: boolean
  isOwn: boolean
  createdAt: string
  updatedAt: string
  authorFirstName: string | null
  authorLastName: string | null
}

export function mapPublishedFeedRow(
  row: PublishedFeedRow,
  viewerId: string | null
): PublishedReviewItem {
  const isAnonymous = row.is_anonymous === true
  return {
    id: row.id,
    siteId: row.site_id,
    siteName: unwrap(row.site)?.site_name ?? "Unknown site",
    rating: row.rating,
    comment: row.comment ?? null,
    isAnonymous,
    isOwn: isOwnReview(row.tourist_id, viewerId),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    ...resolveAuthorNames(isAnonymous, row.tourist),
  }
}
