import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { MEDIA_STORAGE_BUCKET } from "../constants"
import type {
  MediaUploadMetadata,
  MediaSettings,
  SignedUploadUrlResponse,
} from "../types"
import type { HeritageSiteMedia } from "@/types/heritage"

function mapDbMedia(row: Record<string, unknown>): HeritageSiteMedia {
  return {
    id: row.id as string,
    siteId: row.site_id as string,
    mediaType: (row.media_type as HeritageSiteMedia["mediaType"]) ?? "image",
    fileUrl: row.file_url as string,
    fileName: (row.file_name as string) ?? null,
    fileSizeBytes: (row.file_size_bytes as number) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    isPrimary: (row.is_primary as boolean) ?? false,
    sortOrder: (row.sort_order as number) ?? 0,
    caption: (row.caption as string) ?? null,
    uploadedBy: (row.uploaded_by as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function getSignedUploadUrl(
  siteId: string,
  fileName: string,
  _contentType: string
): Promise<SignedUploadUrlResponse> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const ext = fileName.split(".").pop() ?? "bin"
  const filePath = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

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

export async function completeUpload(
  siteId: string,
  filePath: string,
  token: string,
  metadata: MediaUploadMetadata
): Promise<HeritageSiteMedia> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: urlData } = supabase.storage
    .from(MEDIA_STORAGE_BUCKET)
    .getPublicUrl(filePath)

  const { count } = await supabase
    .from("heritage_site_media")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)

  const { data: dbRow, error: dbError } = await supabase
    .from("heritage_site_media")
    .insert({
      site_id: siteId,
      media_type: metadata.mediaType,
      file_url: urlData.publicUrl,
      file_name: metadata.fileName,
      file_size_bytes: metadata.fileSizeBytes,
      mime_type: metadata.mimeType,
      caption: metadata.caption ?? null,
      uploaded_by: user?.id ?? null,
      is_primary: false,
      sort_order: count ?? 0,
    })
    .select()
    .single()

  if (dbError) throw new Error(`Failed to register media: ${dbError.message}`)

  return mapDbMedia(dbRow as Record<string, unknown>)
}

export async function getMediaBySiteId(siteId: string): Promise<HeritageSiteMedia[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("heritage_site_media")
    .select("*")
    .eq("site_id", siteId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => mapDbMedia(row as Record<string, unknown>))
}

export async function setPrimaryImage(siteId: string, mediaId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await supabase
    .from("heritage_site_media")
    .update({ is_primary: false })
    .eq("site_id", siteId)
    .eq("media_type", "image")

  const { error } = await supabase
    .from("heritage_site_media")
    .update({ is_primary: true })
    .eq("id", mediaId)
    .eq("site_id", siteId)

  if (error) throw error
}

export async function deleteMedia(siteId: string, mediaId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: media, error: fetchError } = await supabase
    .from("heritage_site_media")
    .select("file_url")
    .eq("id", mediaId)
    .eq("site_id", siteId)
    .single()

  if (fetchError) throw new Error("Media not found")

  const publicUrl = (media as Record<string, unknown>).file_url as string
  const bucketPrefix = `${MEDIA_STORAGE_BUCKET}/`
  const filePath = publicUrl.split(bucketPrefix)[1]

  if (filePath) {
    await supabase.storage.from(MEDIA_STORAGE_BUCKET).remove([filePath])
  }

  const { error: deleteError } = await supabase
    .from("heritage_site_media")
    .delete()
    .eq("id", mediaId)
    .eq("site_id", siteId)

  if (deleteError) throw deleteError
}

export async function replaceMedia(
  siteId: string,
  mediaId: string,
  metadata: MediaUploadMetadata
): Promise<HeritageSiteMedia> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: oldMedia, error: fetchError } = await supabase
    .from("heritage_site_media")
    .select("file_url, is_primary")
    .eq("id", mediaId)
    .eq("site_id", siteId)
    .single()

  if (fetchError) throw new Error("Media not found")

  const oldRecord = oldMedia as Record<string, unknown>
  const wasPrimary = oldRecord.is_primary as boolean

  const publicUrl = oldRecord.file_url as string
  const bucketPrefix = `${MEDIA_STORAGE_BUCKET}/`
  const oldFilePath = publicUrl.split(bucketPrefix)[1]

  const { uploadUrl, filePath } = await getSignedUploadUrl(siteId, metadata.fileName, metadata.mimeType)

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: new Blob(),
    headers: { "Content-Type": metadata.mimeType },
  })

  if (!response.ok) throw new Error("Failed to upload replacement file")

  if (oldFilePath) {
    await supabase.storage.from(MEDIA_STORAGE_BUCKET).remove([oldFilePath])
  }

  const { data: urlData } = supabase.storage
    .from(MEDIA_STORAGE_BUCKET)
    .getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from("heritage_site_media")
    .update({
      file_url: urlData.publicUrl,
      file_name: metadata.fileName,
      file_size_bytes: metadata.fileSizeBytes,
      mime_type: metadata.mimeType,
      is_primary: wasPrimary,
    })
    .eq("id", mediaId)
    .eq("site_id", siteId)

  if (updateError) throw updateError

  const { data: updated } = await supabase
    .from("heritage_site_media")
    .select("*")
    .eq("id", mediaId)
    .single()

  return mapDbMedia(updated as Record<string, unknown>)
}

export async function getMediaSettings(): Promise<MediaSettings> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", [
      "media_allowed_image_types",
      "media_allowed_document_types",
      "media_allowed_video_types",
      "media_max_image_bytes",
      "media_max_document_bytes",
      "media_max_video_bytes",
      "max_media_images_per_site",
      "max_media_documents_per_site",
      "max_media_videos_per_site",
    ])

  const settings: Record<string, unknown> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }

  return {
    allowedImageTypes: (settings.media_allowed_image_types as string[]) ?? ["image/jpeg", "image/png"],
    allowedDocumentTypes: (settings.media_allowed_document_types as string[]) ?? [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    allowedVideoTypes: (settings.media_allowed_video_types as string[]) ?? ["video/mp4", "video/quicktime"],
    maxImageBytes: (settings.media_max_image_bytes as number) ?? 10_485_760,
    maxDocumentBytes: (settings.media_max_document_bytes as number) ?? 10_485_760,
    maxVideoBytes: (settings.media_max_video_bytes as number) ?? 104_857_600,
    maxImagesPerSite: (settings.max_media_images_per_site as number) ?? 20,
    maxDocumentsPerSite: (settings.max_media_documents_per_site as number) ?? 5,
    maxVideosPerSite: (settings.max_media_videos_per_site as number) ?? 3,
  }
}

export async function getMediaCount(siteId: string): Promise<Record<string, number>> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from("heritage_site_media")
    .select("media_type")
    .eq("site_id", siteId)

  const counts: Record<string, number> = { image: 0, document: 0, video: 0 }
  for (const row of data ?? []) {
    const t = row.media_type as string
    if (t in counts) counts[t]++
  }
  return counts
}

export async function reorderMedia(siteId: string, mediaId: string, direction: "up" | "down"): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: current, error: fetchErr } = await supabase
    .from("heritage_site_media")
    .select("id, sort_order")
    .eq("site_id", siteId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (fetchErr) throw fetchErr

  const items = (current ?? []) as { id: string; sort_order: number }[]
  const idx = items.findIndex((r) => r.id === mediaId)
  if (idx === -1) throw new Error("Media not found")

  const swapIdx = direction === "up" ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= items.length) return

  const a = items[idx]
  const b = items[swapIdx]

  await supabase
    .from("heritage_site_media")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)

  await supabase
    .from("heritage_site_media")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
}
