import type { HeritageSiteMedia, MediaType } from "@/types/heritage"

export type { HeritageSiteMedia, MediaType }

export interface MediaUploadMetadata {
  siteId: string
  mediaType: MediaType
  fileName: string
  fileSizeBytes: number
  mimeType: string
  caption?: string
}

export interface MediaSettings {
  allowedImageTypes: string[]
  allowedDocumentTypes: string[]
  allowedVideoTypes: string[]
  maxImageBytes: number
  maxDocumentBytes: number
  maxVideoBytes: number
}

export interface SignedUploadUrlResponse {
  uploadUrl: string
  filePath: string
  token: string
}

export type MediaTabType = "image" | "document" | "video"
