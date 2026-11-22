export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  }
  return "https://cultural-heritage.techsite.live"
}

export function getQrCodeUrl(codeValue: string): string {
  return `${getAppBaseUrl()}/qr/${encodeURIComponent(codeValue.trim())}`
}

export function extractQrCodeValue(raw: string): string {
  if (!raw || typeof raw !== "string") return ""
  let trimmed = raw.trim()

  try {
    trimmed = decodeURIComponent(trimmed)
  } catch {
    // Keep trimmed as-is if decode fails
  }

  // 1. Extract from /qr/<codeValue> regardless of domain or query parameters
  const qrMatch = trimmed.match(/\/qr\/([A-Za-z0-9_-]+)/i)
  if (qrMatch) {
    return qrMatch[1].toUpperCase()
  }

  // 2. Extract from /heritage/<uuid> if someone scanned a direct site link
  const heritageMatch = trimmed.match(/\/heritage\/([0-9a-f-]{36})/i)
  if (heritageMatch) {
    return heritageMatch[1].toLowerCase()
  }

  return trimmed.toUpperCase()
}
