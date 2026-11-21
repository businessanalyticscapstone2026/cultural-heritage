export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "https://cultural-heritage-three.vercel.app"
}

export function getQrCodeUrl(codeValue: string): string {
  return `${getAppBaseUrl()}/qr/${encodeURIComponent(codeValue.trim())}`
}

export function extractQrCodeValue(raw: string): string {
  const trimmed = raw.trim()
  const urlMatch = trimmed.match(/\/qr\/([A-Za-z0-9_-]+)/i)
  if (urlMatch) {
    return urlMatch[1]
  }
  return trimmed
}
