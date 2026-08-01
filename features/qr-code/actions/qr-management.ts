"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import {
  getMtoQrKpiCounts,
  getMtoQrCodes,
  getMtoQrCodeById,
  getMtoRecentScanLogs,
  getMtoSitesForQrGeneration,
  generateQrCode,
  regenerateQrCode,
  updateQrCodeStatus,
  generateQrSvgDataUrl,
} from "../services/qr-management"
import type { QRCodeWithSite, QRKpiCounts, QRScanLogEntry, QRCodeStatus, SiteOption } from "../types"

async function getAuthContext() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("id, municipality_id, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) {
    throw new Error("MTO staff must be assigned to a municipality")
  }

  return { staffProfileId: profile.id, municipalityId: profile.municipality_id, profile }
}

/** Feeds the 4 KPI cards: Total QR Codes, Active, Inactive, Scans This Month */
export async function getMtoQrKpiCountsAction(): Promise<QRKpiCounts> {
  const { municipalityId } = await getAuthContext()
  return getMtoQrKpiCounts(municipalityId)
}

/** Feeds the main QR codes table */
export async function getMtoQrCodesAction(): Promise<QRCodeWithSite[]> {
  const { municipalityId } = await getAuthContext()
  return getMtoQrCodes(municipalityId)
}

/** Feeds the detail panel */
export async function getMtoQrCodeByIdAction(qrCodeId: string): Promise<QRCodeWithSite | null> {
  const { municipalityId } = await getAuthContext()
  return getMtoQrCodeById(qrCodeId, municipalityId)
}

/** Feeds the Generate QR Code site dropdown */
export async function getMtoSitesForQrGenerationAction(): Promise<SiteOption[]> {
  const { municipalityId } = await getAuthContext()
  return getMtoSitesForQrGeneration(municipalityId)
}

/** Feeds the Recent QR Code Scans list (consumes qr_scan_logs written by CHTS-028) */
export async function getMtoRecentScanLogsAction(limit = 20): Promise<QRScanLogEntry[]> {
  const { municipalityId } = await getAuthContext()
  return getMtoRecentScanLogs(municipalityId, limit)
}

/**
 * Generate a new QR code for a heritage site.
 * code_value uniqueness is enforced server-side (DB UNIQUE constraint + UUID collision safety).
 * Does NOT use optimistic UI — generation is server-validated only.
 */
export async function generateQrCodeAction(siteId: string): Promise<QRCodeWithSite> {
  const { municipalityId, staffProfileId } = await getAuthContext()

  const supabase = createClient(await cookies())

  const { data: site } = await supabase
    .from("heritage_sites")
    .select("id, municipality_id")
    .eq("id", siteId)
    .eq("municipality_id", municipalityId)
    .maybeSingle()

  if (!site) throw new Error("Site not found in your municipality")

  const { data: existing } = await supabase
    .from("qr_codes")
    .select("id")
    .eq("site_id", siteId)
    .maybeSingle()

  if (existing) {
    throw new Error(
      "This heritage site already has a QR code. Open its QR details to regenerate or reactivate it.",
    )
  }

  const qrCode = await generateQrCode(siteId, staffProfileId)

  revalidatePath("/mto/qr-codes")
  return qrCode
}

/**
 * Regenerate a QR code by replacing the existing row's code_value.
 * Keeps one QR code per heritage site.
 */
export async function regenerateQrCodeAction(qrCodeId: string): Promise<QRCodeWithSite> {
  const { municipalityId, staffProfileId } = await getAuthContext()
  const qrCode = await regenerateQrCode(qrCodeId, staffProfileId, municipalityId)

  revalidatePath("/mto/qr-codes")
  return qrCode
}

/**
 * Toggle QR code status.
 * Uses Optimistic UI Strategy — state is updated client-side before the server confirms.
 */
export async function updateQrCodeStatusAction(
  qrCodeId: string,
  status: QRCodeStatus,
): Promise<void> {
  const { municipalityId } = await getAuthContext()
  await updateQrCodeStatus(qrCodeId, status, municipalityId)
  revalidatePath("/mto/qr-codes")
}

/** Generate a QR code SVG data URL for display in the detail panel */
export async function generateQrCodePreviewAction(codeValue: string): Promise<string> {
  return generateQrSvgDataUrl(codeValue)
}
