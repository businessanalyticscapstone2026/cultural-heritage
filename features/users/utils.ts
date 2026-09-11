/**
 * Drop keys whose value is an empty string.
 *
 * Used by the staff edit flow: rows created outside the UI can carry NULL
 * profile fields, which the form surfaces as "". Sending those would trip
 * server-side min(1) validation, so untouched empties are omitted instead —
 * the PATCH endpoints already treat absent fields as "keep existing value".
 */
export function stripEmptyStrings<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  const result: Partial<T> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== "") {
      result[key as keyof T] = value as T[keyof T]
    }
  }
  return result
}
