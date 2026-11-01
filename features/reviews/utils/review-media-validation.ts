import {
  REVIEW_MEDIA_EXTENSIONS,
  REVIEW_MEDIA_LIMITS,
  type ReviewMediaType,
} from "../constants"

/** Shared by the client uploader and server verification (no browser/Node APIs). */

const MB = 1024 * 1024

export function getMediaTypeForMime(mimeType: string): ReviewMediaType | null {
  const normalized = mimeType.toLowerCase()
  if ((REVIEW_MEDIA_LIMITS.image.mimeTypes as readonly string[]).includes(normalized)) return "image"
  if ((REVIEW_MEDIA_LIMITS.video.mimeTypes as readonly string[]).includes(normalized)) return "video"
  return null
}

export function getExtensionForMime(mimeType: string): string | null {
  return REVIEW_MEDIA_EXTENSIONS[mimeType.toLowerCase()] ?? null
}

export function formatMegabytes(bytes: number): string {
  return `${Math.round((bytes / MB) * 10) / 10} MB`
}

export type MediaCandidateError =
  | { code: "unsupported_type"; message: string }
  | { code: "too_large"; message: string }
  | { code: "too_many"; message: string }

/**
 * Validate a file the user picked against type, size and count limits.
 * `current` counts media already attached (kept or in-progress uploads).
 */
export function validateMediaCandidate(
  file: { name: string; type: string; size: number },
  current: { image: number; video: number }
): MediaCandidateError | null {
  const mediaType = getMediaTypeForMime(file.type)
  if (!mediaType) {
    const isHeic = /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type)
    return {
      code: "unsupported_type",
      message: isHeic
        ? `${file.name}: HEIC photos aren't supported yet. Please export as JPEG or set your camera to "Most Compatible".`
        : `${file.name}: only JPEG, PNG, WebP photos and MP4/MOV videos are allowed.`,
    }
  }
  const limits = REVIEW_MEDIA_LIMITS[mediaType]
  if (file.size > limits.maxBytes) {
    return {
      code: "too_large",
      message: `${file.name} is ${formatMegabytes(file.size)}. ${mediaType === "image" ? "Photos" : "Videos"} must be ${formatMegabytes(limits.maxBytes)} or smaller.`,
    }
  }
  if (current[mediaType] >= limits.maxCount) {
    return {
      code: "too_many",
      message:
        mediaType === "image"
          ? `You can attach up to ${limits.maxCount} photos.`
          : `You can attach up to ${limits.maxCount} video.`,
    }
  }
  return null
}

/**
 * Detect the real media type from the first bytes of a file (magic numbers),
 * so the server does not trust the client-declared Content-Type.
 * Returns the matching MIME type or null if unrecognized.
 */
export function sniffMediaMime(bytes: Uint8Array): string | null {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...Array.from(bytes.subarray(start, end)))

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    ascii(1, 4) === "PNG" &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png"
  }
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return "image/webp"
  }
  if (bytes.length >= 12) {
    const box = ascii(4, 8)
    if (box === "ftyp") {
      const brand = ascii(8, 12)
      return brand === "qt  " ? "video/quicktime" : "video/mp4"
    }
    if (box === "moov" || box === "mdat" || box === "wide" || box === "free") {
      return "video/quicktime"
    }
  }
  return null
}

/**
 * Whether sniffed bytes are consistent with the declared MIME type. MP4 and
 * QuickTime share the ISO-BMFF container, so either video sniff satisfies
 * either declared video type.
 */
export function isSniffedMimeCompatible(declared: string, sniffed: string | null): boolean {
  if (!sniffed) return false
  const declaredType = getMediaTypeForMime(declared)
  if (declaredType === "video") return getMediaTypeForMime(sniffed) === "video"
  return declared.toLowerCase() === sniffed
}
