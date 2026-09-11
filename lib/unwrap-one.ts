/**
 * Normalize a PostgREST embedded resource to a single row.
 *
 * To-one relations (e.g. `heritage_sites.category_id -> heritage_categories.id`)
 * arrive as a single object, to-many relations as arrays — and supabase-js may
 * return either shape depending on FK detection. Accept both so real data is
 * never silently discarded (the `Array.isArray(x) ? x[0] : null` pattern drops
 * the object shape entirely).
 */
export function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}
