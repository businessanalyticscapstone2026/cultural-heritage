/**
 * Formats heritage category names for presentation across user interfaces.
 * Maps legacy/database "Natural" to the tourist-facing "Natural Attraction".
 */
export function formatCategoryName(name: string | null | undefined): string {
  if (!name) return ""
  if (name.trim().toLowerCase() === "natural") return "Natural Attraction"
  return name
}
