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
  getMediaCount,
  reorderMedia,
} from "../services"
import type { MediaUploadMetadata } from "../types"
import type { HeritageSiteMedia } from "@/types/heritage"
import { MEDIA_STORAGE_BUCKET } from "../constants"

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
  await verifyMtoOwnership(siteId)
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

export async function getMediaCountAction(siteId: string): Promise<Record<string, number>> {
  await verifyMtoOwnership(siteId)
  return getMediaCount(siteId)
}

export async function reorderMediaAction(siteId: string, mediaId: string, direction: "up" | "down"): Promise<void> {
  await verifyMtoOwnership(siteId)
  return reorderMedia(siteId, mediaId, direction)
}

export async function requestCategoryImageUploadUrlAction(fileName: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const ext = fileName.split(".").pop() ?? "bin"
  const filePath = `categories/${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { data, error } = await supabase.storage
    .from(MEDIA_STORAGE_BUCKET)
    .createSignedUploadUrl(filePath)

  if (error) throw new Error(`Failed to create upload URL: ${error.message}`)

  return {
    uploadUrl: data.signedUrl,
    filePath,
    token: data.token,
  }
}

export async function resolveCategoryImageUrlAction(filePath: string): Promise<string> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data } = supabase.storage.from(MEDIA_STORAGE_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

export async function deleteCategoryImageAction(filePath: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase.storage.from(MEDIA_STORAGE_BUCKET).remove([filePath])
  if (error) throw new Error(`Failed to delete image: ${error.message}`)
}
