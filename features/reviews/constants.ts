export const BLOCKED_WORDS = [
  "spam",
  "scam",
  "fake",
  "ads",
  "buy now",
  "click here",
  "free money",
  "nigerian prince",
  "viagra",
  "casino online",
  "porn",
  "xxx",
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "crap",
  "bastard",
  "slut",
  "dick",
  "cock",
  "pussy",
  " cunt",
  "retard",
  "idiot",
  "moron",
  "stupid",
  "dumbass",
  "motherfucker",
  "wtf",
  "stfu",
  "gtfo",
]

export const MAX_COMMENT_LENGTH = 1000
export const REVIEWS_PER_PAGE = 10
export const REPORT_FLAG_THRESHOLD = 3

// ---------------------------------------------------------------------------
// CHT-135 rich reviews. Stable keys are stored in the database; labels are
// display-only and may change freely. Shared by client and server.
// ---------------------------------------------------------------------------

export const REVIEW_CRITERIA = [
  { key: "site_condition", label: "Site condition", description: "Upkeep, cleanliness and preservation" },
  { key: "cultural_value", label: "Cultural value", description: "Historical and cultural significance" },
  { key: "accessibility", label: "Accessibility", description: "Ease of getting there and moving around" },
  { key: "guides_information", label: "Guides & information", description: "Guides, signage and interpretation" },
  { key: "safety", label: "Safety", description: "How safe you felt during your visit" },
  { key: "value_for_money", label: "Value for money", description: "Worth the fees and travel cost" },
] as const

export type ReviewCriterionKey = (typeof REVIEW_CRITERIA)[number]["key"]

export const REVIEW_CRITERION_KEYS = REVIEW_CRITERIA.map((c) => c.key) as [
  ReviewCriterionKey,
  ...ReviewCriterionKey[],
]

export type ReviewTagSentiment = "positive" | "negative"

/**
 * Quick-feedback tags. `maintenance: true` marks negative tags that signal a
 * maintenance problem; they feed the DSS maintenance alert.
 */
export const REVIEW_TAGS = [
  { key: "well_maintained", label: "Well maintained", sentiment: "positive", maintenance: false },
  { key: "informative_guide", label: "Informative guide", sentiment: "positive", maintenance: false },
  { key: "rich_history", label: "Rich history", sentiment: "positive", maintenance: false },
  { key: "great_photo_spot", label: "Great photo spot", sentiment: "positive", maintenance: false },
  { key: "clean_facilities", label: "Clean facilities", sentiment: "positive", maintenance: false },
  { key: "family_friendly", label: "Family friendly", sentiment: "positive", maintenance: false },
  { key: "easy_to_find", label: "Easy to find", sentiment: "positive", maintenance: false },
  { key: "crowded", label: "Crowded", sentiment: "negative", maintenance: false },
  { key: "poor_signage", label: "Poor signage", sentiment: "negative", maintenance: true },
  { key: "needs_repair", label: "Needs repair", sentiment: "negative", maintenance: true },
  { key: "dirty_restrooms", label: "Dirty restrooms", sentiment: "negative", maintenance: true },
  { key: "unsafe_area", label: "Felt unsafe", sentiment: "negative", maintenance: true },
  { key: "hard_to_access", label: "Hard to access", sentiment: "negative", maintenance: false },
  { key: "limited_parking", label: "Limited parking", sentiment: "negative", maintenance: false },
] as const satisfies readonly {
  key: string
  label: string
  sentiment: ReviewTagSentiment
  maintenance: boolean
}[]

export type ReviewTagKey = (typeof REVIEW_TAGS)[number]["key"]

export const REVIEW_TAG_KEYS = REVIEW_TAGS.map((t) => t.key) as [ReviewTagKey, ...ReviewTagKey[]]

export const MAINTENANCE_TAG_KEYS: readonly ReviewTagKey[] = REVIEW_TAGS.filter(
  (t) => t.maintenance
).map((t) => t.key)

export const MAX_REVIEW_TAGS = 6

export const ANONYMOUS_AUTHOR_LABEL = "Anonymous Visitor"

export const REVIEW_MEDIA_BUCKET = "review-media"

const MB = 1024 * 1024

/**
 * Tourist review upload limits (intentionally stricter than the staff
 * heritage-media limits). Mirrored at bucket level in migration
 * 20261101000000_rich_reviews.sql (largest size + union of MIME types).
 */
export const REVIEW_MEDIA_LIMITS = {
  image: {
    maxCount: 5,
    maxBytes: 5 * MB,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  video: {
    maxCount: 1,
    maxBytes: 30 * MB,
    mimeTypes: ["video/mp4", "video/quicktime"],
  },
} as const

export type ReviewMediaType = keyof typeof REVIEW_MEDIA_LIMITS

/** File extension used in storage object names, per allowed MIME type. */
export const REVIEW_MEDIA_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
}

/** Object names are "<random uuid>/<random uuid>.<ext>" (no user id). */
export const REVIEW_MEDIA_PATH_PATTERN =
  /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|mov)$/
