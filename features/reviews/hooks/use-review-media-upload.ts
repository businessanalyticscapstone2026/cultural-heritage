"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { compressImage } from "@/lib/image-compression"
import type { ReviewMedia } from "@/types/review"
import {
  createReviewMediaUploadAction,
  discardReviewMediaUploadsAction,
} from "../actions/review"
import type { ReviewMediaRef } from "../schemas/review"
import {
  getMediaTypeForMime,
  validateMediaCandidate,
} from "../utils/review-media-validation"

export type ReviewMediaItemStatus = "uploading" | "uploaded" | "error"

export interface ReviewMediaItem {
  localId: string
  mediaType: "image" | "video"
  fileName: string
  fileSizeBytes: number
  mimeType: string
  previewUrl: string
  /** True when the preview is a local blob URL (revoke on removal). */
  isLocalPreview: boolean
  status: ReviewMediaItemStatus
  progress: number
  storagePath: string | null
  /** Already attached to the saved review (removal is applied on submit). */
  attached: boolean
  error: string | null
  file: File | null
}

function fromExisting(media: ReviewMedia): ReviewMediaItem {
  return {
    localId: media.id,
    mediaType: media.mediaType,
    fileName: media.fileName,
    fileSizeBytes: media.fileSizeBytes,
    mimeType: media.mimeType,
    previewUrl: media.fileUrl,
    isLocalPreview: false,
    status: "uploaded",
    progress: 100,
    storagePath: media.storagePath,
    attached: true,
    error: null,
    file: null,
  }
}

function putFile(
  url: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.setRequestHeader("Cache-Control", "max-age=604800, public")
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed (HTTP ${xhr.status})`))
    })
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")))
    xhr.send(file)
  })
}

/**
 * Client-side state for review photo/video uploads: validation against the
 * shared limits, direct upload to a signed URL with progress, retry, removal
 * and orphan cleanup of uploads that never got attached to a review.
 */
export function useReviewMediaUpload(initialMedia: readonly ReviewMedia[]) {
  const [items, setItems] = useState<ReviewMediaItem[]>(() => initialMedia.map(fromExisting))
  const [rejections, setRejections] = useState<string[]>([])
  const itemsRef = useRef(items)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const patch = useCallback((localId: string, changes: Partial<ReviewMediaItem>) => {
    setItems((prev) => prev.map((i) => (i.localId === localId ? { ...i, ...changes } : i)))
  }, [])

  const upload = useCallback(
    async (item: ReviewMediaItem) => {
      if (!item.file) return
      patch(item.localId, { status: "uploading", progress: 0, error: null })

      let fileToUpload = item.file
      if (item.mediaType === "image") {
        fileToUpload = await compressImage(item.file)
      }

      const ticket = await createReviewMediaUploadAction({
        fileName: fileToUpload.name,
        mimeType: fileToUpload.type,
        fileSizeBytes: fileToUpload.size,
      })
      if (!ticket.ok) {
        patch(item.localId, { status: "error", error: ticket.error })
        return
      }
      patch(item.localId, { storagePath: ticket.data.storagePath })
      try {
        await putFile(ticket.data.signedUrl, fileToUpload, (progress) =>
          patch(item.localId, { progress })
        )
        patch(item.localId, { status: "uploaded", progress: 100 })
      } catch (err) {
        patch(item.localId, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        })
      }
    },
    [patch]
  )

  const addFiles = useCallback(
    (files: readonly File[]) => {
      const counts = { image: 0, video: 0 }
      for (const i of itemsRef.current) counts[i.mediaType]++

      const accepted: ReviewMediaItem[] = []
      const errors: string[] = []
      for (const file of files) {
        const error = validateMediaCandidate(file, counts)
        const mediaType = getMediaTypeForMime(file.type)
        if (error || !mediaType) {
          errors.push(error?.message ?? `${file.name}: unsupported file type.`)
          continue
        }
        counts[mediaType]++
        accepted.push({
          localId: crypto.randomUUID(),
          mediaType,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
          isLocalPreview: true,
          status: "uploading",
          progress: 0,
          storagePath: null,
          attached: false,
          error: null,
          file,
        })
      }

      setRejections(errors)
      if (accepted.length === 0) return
      setItems((prev) => [...prev, ...accepted])
      accepted.forEach((item) => void upload(item))
    },
    [upload]
  )

  const retry = useCallback(
    (localId: string) => {
      const item = itemsRef.current.find((i) => i.localId === localId)
      if (item) void upload(item)
    },
    [upload]
  )

  const remove = useCallback((localId: string) => {
    const item = itemsRef.current.find((i) => i.localId === localId)
    if (!item) return
    if (item.isLocalPreview) URL.revokeObjectURL(item.previewUrl)
    if (!item.attached && item.storagePath) {
      void discardReviewMediaUploadsAction([item.storagePath]).then((res) => {
        if (!res.ok) console.error("[reviews] discard upload failed:", res.error)
      })
    }
    setItems((prev) => prev.filter((i) => i.localId !== localId))
  }, [])

  /** Call after a successful submit: uploads are now attached to the review. */
  const markAllAttached = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, attached: true, file: null })))
    itemsRef.current = itemsRef.current.map((i) => ({ ...i, attached: true }))
  }, [])

  // Orphan cleanup: discard uploads that were never attached when the form unmounts.
  useEffect(() => {
    return () => {
      const pending = itemsRef.current
        .filter((i) => !i.attached && i.storagePath)
        .map((i) => i.storagePath as string)
      itemsRef.current.forEach((i) => i.isLocalPreview && URL.revokeObjectURL(i.previewUrl))
      if (pending.length > 0) void discardReviewMediaUploadsAction(pending)
    }
  }, [])

  const mediaRefs: ReviewMediaRef[] = items
    .filter((i) => i.status === "uploaded" && i.storagePath)
    .map((i) => ({
      storagePath: i.storagePath as string,
      mediaType: i.mediaType,
      fileName: i.fileName,
      fileSizeBytes: i.fileSizeBytes,
      mimeType: i.mimeType,
    }))

  return {
    items,
    rejections,
    mediaRefs,
    isUploading: items.some((i) => i.status === "uploading"),
    hasFailedUploads: items.some((i) => i.status === "error"),
    addFiles,
    retry,
    remove,
    markAllAttached,
    clearRejections: () => setRejections([]),
  }
}
