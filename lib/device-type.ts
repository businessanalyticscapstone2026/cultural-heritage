export function normalizeDeviceType(raw: string | null | undefined): string {
  const value = raw?.toLowerCase() ?? ""
  if (!value || value === "unknown") return "Unknown"
  if (/android|iphone|ios|mobile|smartphone/.test(value)) return "Mobile"
  if (/ipad|tablet/.test(value)) return "Tablet"
  if (/desktop|pc|windows|mac|linux|web/.test(value)) return "Desktop"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function parseUserAgentDevice(userAgent?: string | null): string {
  const ua = userAgent || ""
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS Safari"
  if (/Android/.test(ua)) {
    if (/Chrome/.test(ua)) return "Android Chrome"
    if (/Samsung/.test(ua)) return "Android Samsung"
    return "Android Browser"
  }
  if (/Mac/.test(ua)) return "macOS"
  if (/Windows/.test(ua)) return "Windows"
  return "Unknown"
}
