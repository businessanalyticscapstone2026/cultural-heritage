import { BLOCKED_WORDS } from "../constants"

/**
 * Server-side comment moderation shared by every review write path
 * (Server Actions and route handlers). Moved out of actions/review.ts.
 */

const BLOCKED_PATTERNS = BLOCKED_WORDS.map((word) => {
  const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}\\b`, "i")
})

export const PROFANITY_ERROR_MESSAGE =
  "Your review contains language that is not allowed. Please revise and try again."

export function containsProfanity(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text))
}

/** Returns an error message if the comment is not allowed, otherwise null. */
export function checkReviewComment(comment: string | null | undefined): string | null {
  if (comment && containsProfanity(comment)) return PROFANITY_ERROR_MESSAGE
  return null
}
