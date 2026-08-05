import { toast } from "sonner"

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again."

export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifyError(reason?: string | null) {
  toast.error(reason?.trim() ? reason : DEFAULT_ERROR_MESSAGE)
}

export function errorReason(error: unknown, fallback = DEFAULT_ERROR_MESSAGE) {
  return error instanceof Error ? error.message : fallback
}
