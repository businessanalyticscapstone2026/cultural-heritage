/**
 * Date utility helpers for local timezone date-string formatting and constraints.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getLocalTodayDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Clamps a given YYYY-MM-DD date string so it never exceeds today's local date.
 */
export function clampDateToToday(dateStr?: string | null): string {
  const today = getLocalTodayDate()
  if (!dateStr) return today
  return dateStr > today ? today : dateStr
}

/**
 * Validates and clamps a date range [dateFrom, dateTo] so:
 * 1. Neither date exceeds today.
 * 2. dateFrom does not exceed dateTo.
 */
export function clampDateRange(
  dateFrom?: string | null,
  dateTo?: string | null
): { dateFrom: string; dateTo: string } {
  const today = getLocalTodayDate()
  let safeTo = dateTo ? (dateTo > today ? today : dateTo) : today
  let safeFrom = dateFrom ? (dateFrom > today ? today : dateFrom) : safeTo

  if (safeFrom > safeTo) {
    safeFrom = safeTo
  }

  return { dateFrom: safeFrom, dateTo: safeTo }
}
