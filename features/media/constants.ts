import type { MediaTabType } from "./types"

export const MEDIA_STORAGE_BUCKET = "heritage-media"

export const MEDIA_TABS: { value: MediaTabType; label: string }[] = [
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Videos" },
]

export const MEDIA_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function getMediaTypeFromMime(mimeType: string): "image" | "document" | "video" {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  return "document"
}

export function getAcceptedExtensions(mediaType: "image" | "document" | "video"): string {
  const map: Record<string, string[]> = {
    image: [".jpg", ".jpeg", ".png"],
    document: [".pdf", ".doc", ".docx"],
    video: [".mp4", ".mov"],
  }
  return map[mediaType].join(",")
}
