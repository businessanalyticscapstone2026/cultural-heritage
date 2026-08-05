export function normalizeDeviceType(raw: string | null | undefined): string {
  const value = raw?.toLowerCase() ?? ""
  if (!value || value === "unknown") return "Unknown"
  if (/android|iphone|ios|mobile|smartphone/.test(value)) return "Mobile"
  if (/ipad|tablet/.test(value)) return "Tablet"
  if (/desktop|pc|windows|mac|linux|web/.test(value)) return "Desktop"
  return value.charAt(0).toUpperCase() + value.slice(1)
}
