// Matches the project's 10MB file-size convention (see features/media/services default).
export const MAX_BOUNDARY_FILE_BYTES = 10 * 1024 * 1024

export const BOUNDARY_ACCEPTED_EXTENSIONS = [".geojson", ".json", ".kml"]

export const BOUNDARY_ACCEPTED_MIME_TYPES = [
  "application/geo+json",
  "application/json",
  "application/vnd.google-earth.kml+xml",
  "application/xml",
  "text/xml",
  "",
  "application/octet-stream",
]

export function formatBoundaryFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

export function getBoundaryFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex === -1) return ""
  return fileName.slice(dotIndex).toLowerCase()
}
