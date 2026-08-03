import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidateTag } from "next/cache"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import type { ScanResult } from "../types"

export async function resolveQRCode(code: string): Promise<ScanResult> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: qrCode, error: qrError } = await supabase
    .from("qr_codes")
    .select("id, site_id, code_value, status")
    .eq("code_value", code)
    .single()

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
    .single()

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

export async function recordScanEvent(codeValue: string, deviceType?: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: qrCode } = await supabase
    .from("qr_codes")
    .select("id")
    .eq("code_value", codeValue)
    .single()

  if (!qrCode) return

  const { error } = await supabase.from("qr_scan_logs").insert({
    qr_code_id: qrCode.id,
    device_type: deviceType ?? null,
  })

  if (error) return

  revalidateTag(CACHE_TAGS.dashboardKpis, { expire: CACHE_REVALIDATE_SECONDS })
  revalidateTag(CACHE_TAGS.dashboardVisits, { expire: CACHE_REVALIDATE_SECONDS })
}
