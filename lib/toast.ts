import { toast } from "sonner"

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

const REDACTED_DIGEST_PATTERN = /error occurred in the server components render|digest property/i

export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifyError(reason?: string | null) {
  toast.error(reason?.trim() ? reason : DEFAULT_ERROR_MESSAGE)
}

export function errorReason(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  if (!(error instanceof Error) || !error.message) return fallback
  if (REDACTED_DIGEST_PATTERN.test(error.message)) return fallback
  return error.message
}
