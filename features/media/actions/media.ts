"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import {
  getSignedUploadUrl,
  completeUpload,
  getMediaBySiteId,
  setPrimaryImage,
  deleteMedia,
  replaceMedia,
  getMediaSettings,
} from "../services"
import type { MediaUploadMetadata } from "../types"
import type { HeritageSiteMedia } from "@/types/heritage"

async function verifyMtoOwnership(siteId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("municipality_id")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.municipality_id) throw new Error("No municipality assigned")

  const { data: site } = await supabase
    .from("heritage_sites")
    .select("municipality_id")
    .eq("id", siteId)
    .maybeSingle()

  if (!site) throw new Error("Heritage site not found")
  if (site.municipality_id !== profile.municipality_id) {
    throw new Error("Access denied: site belongs to another municipality")
  }
}

export async function requestUploadUrlAction(
  siteId: string,
  fileName: string,
  contentType: string
) {
  await verifyMtoOwnership(siteId)
  return getSignedUploadUrl(siteId, fileName, contentType)
}

export async function completeUploadAction(
  siteId: string,
  filePath: string,
  token: string,
  metadata: MediaUploadMetadata
): Promise<HeritageSiteMedia> {
  await verifyMtoOwnership(siteId)
  return completeUpload(siteId, filePath, token, metadata)
}

export async function getMediaAction(siteId: string): Promise<HeritageSiteMedia[]> {
  return getMediaBySiteId(siteId)
}

export async function setPrimaryImageAction(siteId: string, mediaId: string): Promise<void> {
  await verifyMtoOwnership(siteId)
  return setPrimaryImage(siteId, mediaId)
}

export async function deleteMediaAction(siteId: string, mediaId: string): Promise<void> {
  await verifyMtoOwnership(siteId)
  return deleteMedia(siteId, mediaId)
}

export async function replaceMediaAction(
  siteId: string,
  mediaId: string,
  metadata: MediaUploadMetadata
): Promise<HeritageSiteMedia> {
  await verifyMtoOwnership(siteId)
  return replaceMedia(siteId, mediaId, metadata)
}

export async function getMediaSettingsAction() {
  return getMediaSettings()
}
