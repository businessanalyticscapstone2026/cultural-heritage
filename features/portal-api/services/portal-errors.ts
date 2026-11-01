import { isReviewWriteError, type ReviewWriteError } from "@/features/reviews/services/review-errors"
import { PORTAL_RETRY_AFTER_SECONDS } from "../constants"
import type { PortalErrorBody, PortalErrorCode } from "../types"

/**
 * Expected portal API failure. `message` is safe for the API consumer;
 * `detail` is internal and only ever logged on the server.
 */
export class PortalApiError extends Error {
  readonly status: number
  readonly code: PortalErrorCode
  readonly retryAfterSeconds?: number
  readonly details?: Record<string, string[]>
  readonly detail?: string

  constructor(
    status: number,
    code: PortalErrorCode,
    message: string,
    options: {
      retryAfterSeconds?: number
      details?: Record<string, string[]>
      detail?: string
    } = {}
  ) {
    super(message)
    this.name = "PortalApiError"
    this.status = status
    this.code = code
    this.retryAfterSeconds = options.retryAfterSeconds
    this.details = options.details
    this.detail = options.detail
  }

  toBody(): PortalErrorBody {
    const body: PortalErrorBody = { error: this.message, code: this.code }
    if (this.details) body.details = this.details
    return body
  }
}

export function isPortalApiError(err: unknown): err is PortalApiError {
  return err instanceof PortalApiError
}

/** Supabase/Postgres or network failure: tell the caller to retry later. */
export function dependencyUnavailable(detail?: string): PortalApiError {
  return new PortalApiError(
    503,
    "dependency_unavailable",
    "The heritage database is temporarily unavailable. Please retry later.",
    { retryAfterSeconds: PORTAL_RETRY_AFTER_SECONDS, detail }
  )
}

function fromReviewWriteError(err: ReviewWriteError): PortalApiError {
  const opts = { detail: err.detail, details: err.fieldErrors }
  switch (err.code) {
    case "unauthenticated":
      return new PortalApiError(401, "unauthenticated", err.message, opts)
    case "no_tourist_profile":
      return new PortalApiError(
        403,
        "no_tourist_profile",
        "Only tourist accounts can write reviews.",
        opts
      )
    case "forbidden":
      return new PortalApiError(403, "forbidden", err.message, opts)
    case "not_found":
      return new PortalApiError(404, "not_found", err.message, opts)
    case "validation":
      return new PortalApiError(422, "validation_failed", err.message, opts)
    case "moderation":
      return new PortalApiError(422, "moderation_rejected", err.message, opts)
    case "invalid_media":
      return new PortalApiError(422, "invalid_media", err.message, opts)
    case "write_failed":
      return dependencyUnavailable(err.detail)
    case "upload_failed":
      return new PortalApiError(500, "internal_error", "Something went wrong.", opts)
  }
}

/**
 * Map any thrown value to a PortalApiError. Unknown errors become a generic
 * 500 with no internals; the original is logged server-side by the caller.
 */
export function toPortalApiError(err: unknown): PortalApiError {
  if (isPortalApiError(err)) return err
  if (isReviewWriteError(err)) return fromReviewWriteError(err)
  return new PortalApiError(500, "internal_error", "Something went wrong. Please try again.", {
    detail: err instanceof Error ? err.message : String(err),
  })
}
