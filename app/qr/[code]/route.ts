import { NextRequest, NextResponse } from "next/server"
import { resolveQRCode, recordScanEvent } from "@/features/qr-code/services"
import { parseUserAgentDevice } from "@/lib/device-type"
import { getAppBaseUrl } from "@/lib/app-url"

interface RouteProps {
  params: Promise<{ code: string }>
}

/**
 * Universal Direct QR Scan Endpoint.
 * When a tourist scans a QR code using their native phone camera (iOS / Android),
 * this endpoint captures the scan event, logs it to qr_scan_logs and tourist_visits,
 * and 302 redirects to the heritage site detail page on the primary system URL.
 */
export async function GET(request: NextRequest, { params }: RouteProps) {
  const { code } = await params
  const primaryBaseUrl = getAppBaseUrl()

  if (!code) {
    return NextResponse.redirect(new URL("/scan", primaryBaseUrl))
  }

  const result = await resolveQRCode(code)
  if (!result.success || !result.siteId) {
    return NextResponse.redirect(new URL("/scan?error=not_found", primaryBaseUrl))
  }

  const ua = request.headers.get("user-agent")
  const deviceType = parseUserAgentDevice(ua)

  try {
    await recordScanEvent(code, deviceType)
  } catch (err) {
    console.error("Failed to record direct QR scan:", err)
  }

  return NextResponse.redirect(new URL(`/heritage/${result.siteId}`, primaryBaseUrl))
}
