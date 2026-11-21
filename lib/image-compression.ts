/**
 * Client-side image compression utility.
 * Downscales oversized camera/smartphone photos before upload
 * to drastically reduce storage usage and egress bandwidth.
 */

interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  /** Skip compression if file size is below this threshold (bytes). Default: 500 KB */
  minSizeThreshold?: number
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    minSizeThreshold = 500 * 1024,
  } = options

  // Only compress in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return file
  }

  // Only compress raster photos (not SVG, GIF animations, or videos)
  const isCompressible =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"

  if (!isCompressible || file.size <= minSizeThreshold) {
    return file
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Compute downscaled dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, width, height)

      // Use JPEG for photographic content; preserve original if PNG had alpha and is small
      const outputType = file.type === "image/png" ? "image/jpeg" : file.type

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If compression didn't save bytes, keep original
            resolve(file)
            return
          }

          const newFileName =
            outputType === "image/jpeg" && !file.name.match(/\.jpe?g$/i)
              ? file.name.replace(/\.[^.]+$/, ".jpg")
              : file.name

          const compressed = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          })

          resolve(compressed)
        },
        outputType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(file)
    }

    img.src = objectUrl
  })
}
