import { ANONYMOUS_AUTHOR_LABEL } from "../constants"

interface AuthorFields {
  isAnonymous: boolean
  authorFirstName: string | null
  authorLastName: string | null
}

/** Display name for a review author; anonymous reviews always show the anonymous label. */
export function getReviewAuthorName(review: AuthorFields, fallback = "Heritage traveler"): string {
  if (review.isAnonymous) return ANONYMOUS_AUTHOR_LABEL
  const parts = [review.authorFirstName, review.authorLastName].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : fallback
}

export function getReviewAuthorInitials(review: AuthorFields): string {
  if (review.isAnonymous) return "AV"
  const f = review.authorFirstName?.[0] ?? ""
  const l = review.authorLastName?.[0] ?? ""
  return (f + l).toUpperCase() || "?"
}
