import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import { extractQrCodeValue } from "@/lib/app-url"
import { DEFAULT_AGE_GROUP } from "@/lib/constants"
import type { ScanResult } from "../types"

export async function resolveQRCode(rawCode: string): Promise<ScanResult> {
  const code = extractQrCodeValue(rawCode)

  if (!code) {
    return {
      success: false,
      error: "not_found",
      message: "This code is not recognized.",
    }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Primary lookup: case-insensitive by code_value
  let { data: qrCode, error: qrError } = await supabase
    .from("qr_codes")
    .select("id, site_id, code_value, status")
    .ilike("code_value", code)
    .maybeSingle()

  // 2. Fallback: if input is a UUID, check if it directly matches site_id or qr_codes.id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code)
  if (!qrCode && isUuid) {
    const { data: qrBySite } = await supabase
      .from("qr_codes")
      .select("id, site_id, code_value, status")
      .or(`site_id.eq.${code},id.eq.${code}`)
      .maybeSingle()

    if (qrBySite) {
      qrCode = qrBySite
      qrError = null
    }
  }

  if (qrError || !qrCode) {
    return {
      success: false,
      error: "not_found",
      message: "This code is not recognized.",
    }
  }

  if (qrCode.status !== "active") {
    return {
      success: false,
      error: "inactive",
      message: "This code is no longer active.",
    }
  }

  const { data: site, error: siteError } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .eq("id", qrCode.site_id)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .maybeSingle()

  if (siteError || !site) {
    return {
      success: false,
      error: "not_found",
      message: "This site's profile isn't available right now.",
    }
  }

  return {
    success: true,
    siteId: site.id,
    siteName: site.site_name,
    status: qrCode.status,
  }
}

export async function recordScanEvent(rawCodeValue: string, deviceType?: string): Promise<void> {
  const codeValue = extractQrCodeValue(rawCodeValue)
  if (!codeValue) return

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id, site_id")
    .ilike("code_value", codeValue)
    .maybeSingle()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(codeValue)
  if (!qrCode && isUuid) {
    const { data: qrBySite } = await supabase
      .from("qr_codes")
      .select("id, site_id")
      .or(`site_id.eq.${codeValue},id.eq.${codeValue}`)
      .maybeSingle()

    if (qrBySite) {
      qrCode = qrBySite
    }
  }

  if (!qrCode) return

  const { error } = await supabase.from("qr_scan_logs").insert({
    qr_code_id: qrCode.id,
    device_type: deviceType ?? null,
  })

  if (error) {
    console.error("[QR] Failed to insert qr_scan_logs:", error)
    return
  }

  // Mirror the scan as a tourist_visit so visit-based dashboard charts
  // (Monthly Visits Overview, Top Attractions, Visits by Attraction,
  // Visitor Statistics, Analytics) reflect real QR traffic instead of
  // remaining empty when tourist_visits has no rows.
  if (qrCode.site_id) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let ageGroup: string = DEFAULT_AGE_GROUP
    if (user) {
      const { data: profile } = await supabase
        .from("tourist_profiles")
        .select("age_group")
        .eq("id", user.id)
        .maybeSingle()
      ageGroup = profile?.age_group ?? DEFAULT_AGE_GROUP
    }

    const { error: visitError } = await supabase.from("tourist_visits").insert({
      site_id: qrCode.site_id,
      visit_date: new Date().toISOString().slice(0, 10),
      visitor_origin: "domestic",
      visitor_type: "domestic",
      source: "qr_scan",
      tourist_id: user?.id ?? null,
      age_group: ageGroup,
    })
    if (visitError) {
      console.warn("[QR] Failed to mirror tourist_visits:", visitError)
    }
  }

  revalidateTag(CACHE_TAGS.dashboardKpis, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardVisits, { expire: CACHE_REVALIDATE_SECONDS })
}
