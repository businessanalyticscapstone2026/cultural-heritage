import type { ReviewFieldErrors } from "../types"

export type ReviewWriteErrorCode =
  | "unauthenticated"
  | "no_tourist_profile"
  | "validation"
  | "moderation"
  | "invalid_media"
  | "upload_failed"
  | "not_found"
  | "forbidden"
  | "write_failed"

/**
 * Expected, user-presentable review write failure. `message` is safe to show
 * to the end user; `cause` carries internal detail for server logs only.
 */
export class ReviewWriteError extends Error {
  readonly code: ReviewWriteErrorCode
  readonly fieldErrors?: ReviewFieldErrors
  readonly detail?: string

  constructor(
    code: ReviewWriteErrorCode,
    message: string,
    detail?: string,
    fieldErrors?: ReviewFieldErrors
  ) {
    super(message)
    this.name = "ReviewWriteError"
    this.code = code
    this.detail = detail
    this.fieldErrors = fieldErrors
  }
}

export function isReviewWriteError(err: unknown): err is ReviewWriteError {
  return err instanceof ReviewWriteError
}
