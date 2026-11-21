import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { QRCodeWithSite, QRKpiCounts, QRScanLogEntry, QRCodeStatus, SiteOption } from "../types"

async function getSupabase() {
  const cookieStore = await cookies()
  return createClient(cookieStore)
}

async function getMunicipalitySiteIds(municipalityId: string): Promise<string[]> {
  const supabase = await getSupabase()
  const { data } = await supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)
    .neq("publication_status", "archived")

  return (data ?? []).map((s) => s.id)
}

export async function getCurrentStaffProfile() {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  return profile
}

function getStartOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

/** Feeds 4 KPI cards: Total QR Codes, Active, Inactive/Revoked, Scans This Month */
export async function getMtoQrKpiCounts(municipalityId: string): Promise<QRKpiCounts> {
  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)

  if (siteIds.length === 0) {
    return { total: 0, active: 0, inactive: 0, scansThisMonth: 0 }
  }

  const { data: allRows } = await supabase
    .from("qr_codes")
    .select("id, status")
    .in("site_id", siteIds)

  const total = allRows?.length ?? 0
  const active = allRows?.filter((r) => r.status === "active").length ?? 0
  const inactive = allRows?.filter((r) => r.status === "inactive" || r.status === "revoked").length ?? 0

  const qrCodeIds = allRows?.map((r) => r.id) ?? []

  let scansThisMonth = 0
  if (qrCodeIds.length > 0) {
    const { count } = await supabase
      .from("qr_scan_logs")
      .select("id", { count: "exact", head: true })
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", getStartOfMonth())

    scansThisMonth = count ?? 0
  }

  return { total, active, inactive, scansThisMonth }
}

async function getSiteMediaMap(siteIds: string[]): Promise<Map<string, { fileUrl: string }>> {
  if (siteIds.length === 0) return new Map()

  const supabase = await getSupabase()
  const { data } = await supabase
    .from("heritage_site_media")
    .select("site_id, file_url")
    .in("site_id", siteIds)
    .eq("media_type", "image")
    .order("sort_order", { ascending: true })

  const map = new Map<string, { fileUrl: string }>()
  const seen = new Set<string>()
  for (const row of data ?? []) {
    const sid = row.site_id as string
    if (!seen.has(sid)) {
      seen.add(sid)
      map.set(sid, { fileUrl: row.file_url as string })
    }
  }
  return map
}

async function getScanCountMap(qrCodeIds: string[]): Promise<Map<string, number>> {
  if (qrCodeIds.length === 0) return new Map()

  const supabase = await getSupabase()
  const { data } = await supabase
    .from("qr_scan_logs")
    .select("qr_code_id, id")
    .in("qr_code_id", qrCodeIds)

  const countMap = new Map<string, number>()
  for (const row of data ?? []) {
    const qid = row.qr_code_id as string
    countMap.set(qid, (countMap.get(qid) ?? 0) + 1)
  }
  return countMap
}

/** Feeds the main QR codes table */
export async function getMtoQrCodes(municipalityId: string): Promise<QRCodeWithSite[]> {
  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)

  if (siteIds.length === 0) return []

  const { data, error } = await supabase
    .from("qr_codes")
    .select(`
      id,
      site_id,
      code_value,
      status,
      created_by,
      created_at,
      creator:staff_profiles!qr_codes_created_by_fkey(first_name, last_name)
    `)
    .in("site_id", siteIds)
    .order("created_at", { ascending: false })

  if (error) throw error

  const allSiteIds = [...new Set((data ?? []).map((r) => r.site_id as string))]
  const siteNames = await getSiteNames(allSiteIds)
  const mediaMap = await getSiteMediaMap(allSiteIds)
  const qrCodeIds = (data ?? []).map((r) => r.id as string)
  const scanCountMap = await getScanCountMap(qrCodeIds)

  return (data ?? []).map((row) => {
    const creator = row.creator as unknown as { first_name: string | null; last_name: string | null } | null
    const siteId = row.site_id as string

    return {
      id: row.id as string,
      siteId,
      siteName: siteNames.get(siteId) ?? "Unknown Site",
      siteThumbnail: mediaMap.get(siteId)?.fileUrl ?? null,
      codeValue: row.code_value as string,
      status: (row.status as QRCodeStatus) ?? "active",
      scanCount: scanCountMap.get(row.id as string) ?? 0,
      createdBy: row.created_by as string | null,
      creatorName: creator
        ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || null
        : null,
      createdAt: row.created_at as string,
    }
  })
}

async function getSiteNames(siteIds: string[]): Promise<Map<string, string>> {
  if (siteIds.length === 0) return new Map()

  const supabase = await getSupabase()
  const { data } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .in("id", siteIds)

  const map = new Map<string, string>()
  for (const row of data ?? []) {
    map.set(row.id as string, row.site_name as string)
  }
  return map
}

/** Feeds the detail panel */
export async function getMtoQrCodeById(
  qrCodeId: string,
  municipalityId: string,
): Promise<QRCodeWithSite | null> {
  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)
  if (siteIds.length === 0) return null

  const { data, error } = await supabase
    .from("qr_codes")
    .select(`
      id,
      site_id,
      code_value,
      status,
      created_by,
      created_at,
      creator:staff_profiles!qr_codes_created_by_fkey(first_name, last_name)
    `)
    .eq("id", qrCodeId)
    .in("site_id", siteIds)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const siteId = data.site_id as string
  const siteName = await getSiteName(siteId)
  const mediaMap = await getSiteMediaMap([siteId])
  const scanCountMap = await getScanCountMap([data.id as string])

  const creator = data.creator as unknown as { first_name: string | null; last_name: string | null } | null

  return {
    id: data.id as string,
    siteId,
    siteName: siteName ?? "Unknown Site",
    siteThumbnail: mediaMap.get(siteId)?.fileUrl ?? null,
    codeValue: data.code_value as string,
    status: (data.status as QRCodeStatus) ?? "active",
    scanCount: scanCountMap.get(data.id as string) ?? 0,
    createdBy: data.created_by as string | null,
    creatorName: creator
      ? `${creator.first_name ?? ""} ${creator.last_name ?? ""}`.trim() || null
      : null,
    createdAt: data.created_at as string,
  }
}

async function getSiteName(siteId: string): Promise<string | null> {
  const supabase = await getSupabase()
  const { data } = await supabase
    .from("heritage_sites")
    .select("site_name")
    .eq("id", siteId)
    .maybeSingle()

  return data?.site_name as string | null
}

/** Feeds the site dropdown in the Generate QR Code dialog */
export async function getMtoSitesForQrGeneration(municipalityId: string): Promise<SiteOption[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("heritage_sites")
    .select("id, site_name")
    .eq("municipality_id", municipalityId)
    .neq("publication_status", "archived")
    .order("site_name", { ascending: true })

  if (error) throw error

  const siteIds = (data ?? []).map((r) => r.id as string)

  if (siteIds.length > 0) {
    const { data: existing } = await supabase
      .from("qr_codes")
      .select("site_id")
      .in("site_id", siteIds)

    const sitesWithQr = new Set((existing ?? []).map((r) => r.site_id as string))
    const eligible = (data ?? []).filter((row) => !sitesWithQr.has(row.id as string))

    const mediaMap = await getSiteMediaMap(eligible.map((r) => r.id as string))

    return eligible.map((row) => {
      const sid = row.id as string
      return {
        id: sid,
        siteName: row.site_name as string,
        thumbnail: mediaMap.get(sid)?.fileUrl ?? null,
      }
    })
  }

  const mediaMap = await getSiteMediaMap(siteIds)

  return (data ?? []).map((row) => {
    const sid = row.id as string
    return {
      id: sid,
      siteName: row.site_name as string,
      thumbnail: mediaMap.get(sid)?.fileUrl ?? null,
    }
  })
}

/** Feeds the Recent QR Code Scans list */
export async function getMtoRecentScanLogs(
  municipalityId: string,
  limit = 20,
): Promise<QRScanLogEntry[]> {
  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)
  if (siteIds.length === 0) return []

  const { data: qrCodes } = await supabase
    .from("qr_codes")
    .select("id, code_value, site_id")
    .in("site_id", siteIds)

  if (!qrCodes || qrCodes.length === 0) return []

  const qrCodeIds = qrCodes.map((r) => r.id as string)
  const qrCodeMap = new Map<string, { codeValue: string; siteId: string }>()
  for (const r of qrCodes) {
    qrCodeMap.set(r.id as string, {
      codeValue: r.code_value as string,
      siteId: r.site_id as string,
    })
  }

  const allSiteIds = [...new Set(qrCodes.map((r) => r.site_id as string))]
  const siteNameMap = await getSiteNames(allSiteIds)

  const { data, error } = await supabase
    .from("qr_scan_logs")
    .select("id, qr_code_id, scanned_at, device_type")
    .in("qr_code_id", qrCodeIds)
    .order("scanned_at", { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const qrId = row.qr_code_id as string
    const qrInfo = qrCodeMap.get(qrId)

    return {
      id: row.id as string,
      qrCodeId: qrId,
      codeValue: qrInfo?.codeValue ?? "",
      siteName: qrInfo?.siteId ? (siteNameMap.get(qrInfo.siteId) ?? "Unknown Site") : "Unknown Site",
      scannedAt: row.scanned_at as string,
      deviceType: row.device_type as string | null,
    }
  })
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateShortCodeValue(length = 6): string {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  let code = "TCDSS-"
  for (const value of values) {
    code += CODE_ALPHABET[value % CODE_ALPHABET.length]
  }
  return code
}

async function generateUniqueCodeValue(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateShortCodeValue()
    const { data } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("code_value", candidate)
      .maybeSingle()

    if (!data) return candidate
  }

  throw new Error("Failed to generate a unique QR code after multiple attempts")
}

/** Generate a new QR code */
export async function generateQrCode(
  siteId: string,
  staffProfileId: string,
): Promise<QRCodeWithSite> {
  const supabase = await getSupabase()
  const codeValue = await generateUniqueCodeValue(supabase)

  const { data, error } = await supabase
    .from("qr_codes")
    .insert({
      site_id: siteId,
      code_value: codeValue,
      status: "active",
      created_by: staffProfileId,
    })
    .select("id, site_id, code_value, status, created_by, created_at")
    .single()

  if (error) throw new Error(`Failed to generate QR code: ${error.message}`)

  const siteName = await getSiteName(siteId)
  const mediaMap = await getSiteMediaMap([siteId])

  return {
    id: data.id as string,
    siteId: data.site_id as string,
    siteName: siteName ?? "Unknown Site",
    siteThumbnail: mediaMap.get(siteId)?.fileUrl ?? null,
    codeValue: data.code_value as string,
    status: (data.status as QRCodeStatus) ?? "active",
    scanCount: 0,
    createdBy: data.created_by as string | null,
    creatorName: null,
    createdAt: data.created_at as string,
  }
}

/**
 * Auto-generate an active QR code for a heritage site when it is created.
 * Best-effort: returns null if the site already has a QR code (the DB unique
 * index on `site_id` also guards against duplicates). Callers decide how to
 * handle failures — see saveMtoSiteAction / createHeritageSiteAction.
 */
export async function autoGenerateQrForSite(
  siteId: string,
  staffProfileId: string,
): Promise<QRCodeWithSite | null> {
  const supabase = await getSupabase()

  const { data: existing } = await supabase
    .from("qr_codes")
    .select("id")
    .eq("site_id", siteId)
    .maybeSingle()

  if (existing) return null

  return generateQrCode(siteId, staffProfileId)
}

/** Regenerate a QR code: replaces the existing row's code_value, keeping one QR per site */
export async function regenerateQrCode(
  qrCodeId: string,
  staffProfileId: string,
  municipalityId: string,
): Promise<QRCodeWithSite> {
  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)

  if (siteIds.length === 0) {
    throw new Error("No sites found for this municipality")
  }

  const { data: existing, error: fetchError } = await supabase
    .from("qr_codes")
    .select("id, site_id")
    .eq("id", qrCodeId)
    .in("site_id", siteIds)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!existing) throw new Error("QR code not found in your municipality")

  const codeValue = await generateUniqueCodeValue(supabase)

  const { data, error } = await supabase
    .from("qr_codes")
    .update({
      code_value: codeValue,
      status: "active",
      created_by: staffProfileId,
    })
    .eq("id", qrCodeId)
    .select("id, site_id, code_value, status, created_by, created_at")
    .single()

  if (error) throw new Error(`Failed to regenerate QR code: ${error.message}`)

  const siteId = data.site_id as string
  const siteName = await getSiteName(siteId)
  const mediaMap = await getSiteMediaMap([siteId])

  return {
    id: data.id as string,
    siteId,
    siteName: siteName ?? "Unknown Site",
    siteThumbnail: mediaMap.get(siteId)?.fileUrl ?? null,
    codeValue: data.code_value as string,
    status: (data.status as QRCodeStatus) ?? "active",
    scanCount: 0,
    createdBy: data.created_by as string | null,
    creatorName: null,
    createdAt: data.created_at as string,
  }
}

const VALID_QR_STATUSES: QRCodeStatus[] = ["active", "inactive", "revoked"]

/** Toggle QR code status */
export async function updateQrCodeStatus(
  qrCodeId: string,
  status: QRCodeStatus,
  municipalityId: string,
): Promise<void> {
  if (!VALID_QR_STATUSES.includes(status)) {
    throw new Error(`Invalid QR code status: ${status}`)
  }

  const supabase = await getSupabase()
  const siteIds = await getMunicipalitySiteIds(municipalityId)

  if (siteIds.length === 0) {
    throw new Error("No sites found for this municipality")
  }

  const { error } = await supabase
    .from("qr_codes")
    .update({ status })
    .eq("id", qrCodeId)
    .in("site_id", siteIds)

  if (error) throw new Error(`Failed to update QR code status: ${error.message}`)
}

/**
 * Revoke all QR codes for a heritage site. Called when a site is archived so
 * its QR code is disabled. Best-effort: failures are logged, never rethrown,
 * so archiving the site is never blocked by a QR update.
 */
export async function revokeQrCodesForSite(siteId: string): Promise<void> {
  const supabase = await getSupabase()
  const { error } = await supabase
    .from("qr_codes")
    .update({ status: "revoked" })
    .eq("site_id", siteId)

  if (error) {
    console.error(`Failed to revoke QR code for site ${siteId}:`, error.message)
  }
}

/** Generate QR code SVG data URL */
export async function generateQrSvgDataUrl(content: string): Promise<string> {
  const QRCode = await import("qrcode")
  const svgString = await QRCode.toString(content, {
    type: "svg",
    margin: 2,
    width: 300,
    color: {
      dark: "#1e3a5f",
      light: "#ffffff",
    },
  })
  return `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`
}

/**
 * Generate QR code PNG data URL at high resolution for printing.
 * 1024px yields ~3.4" at 300 DPI while preserving scan reliability.
 */
export async function generateQrPngDataUrl(content: string, size = 1024): Promise<string> {
  const QRCode = await import("qrcode")
  return QRCode.toDataURL(content, {
    type: "image/png",
    width: size,
    margin: 2,
    color: {
      dark: "#1e3a5f",
      light: "#ffffff",
    },
  })
}
