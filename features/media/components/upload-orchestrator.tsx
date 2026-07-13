"use client"

import { useState, useCallback, useRef } from "react"
import UploadZone from "./upload-zone"
import FileValidationFeedback from "./file-validation-feedback"
import UploadProgressList, { type UploadItem } from "./upload-progress-list"
import {
  requestUploadUrlAction,
  completeUploadAction,
} from "../actions/media"
import { getMediaTypeFromMime } from "../constants"
import type { MediaSettings, MediaUploadMetadata } from "../types"
import type { HeritageSiteMedia } from "@/types/heritage"

interface UploadOrchestratorProps {
  siteId: string
  settings: MediaSettings
  onUploadComplete: (media: HeritageSiteMedia) => void
}

interface ValidationError {
  fileName: string
  message: string
}

function validateFile(file: File, settings: MediaSettings): string | null {
  const mediaType = getMediaTypeFromMime(file.type)
  const allowed =
    mediaType === "image"
      ? settings.allowedImageTypes
      : mediaType === "video"
        ? settings.allowedVideoTypes
        : settings.allowedDocumentTypes
  const maxSize =
    mediaType === "image"
      ? settings.maxImageBytes
      : mediaType === "video"
        ? settings.maxVideoBytes
        : settings.maxDocumentBytes

  if (!allowed.includes(file.type)) {
    return `Unsupported file type "${file.type || "unknown"}". Accepted: ${allowed.join(", ")}`
  }

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1_048_576)
    const fileMB = (file.size / 1_048_576).toFixed(1)
    return `File is ${fileMB}MB; the limit is ${maxMB}MB`
  }

  return null
}

let nextId = 0
function uid() {
  return `upload-${++nextId}-${Date.now()}`
}

export default function UploadOrchestrator({
  siteId,
  settings,
  onUploadComplete,
}: UploadOrchestratorProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const abortRefs = useRef<Map<string, AbortController>>(new Map())

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }, [])

  const uploadFile = useCallback(
    async (id: string, file: File) => {
      updateUpload(id, { status: "uploading", progress: 0 })

      try {
        const metadata: MediaUploadMetadata = {
          siteId,
          mediaType: getMediaTypeFromMime(file.type),
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
        }

        const { uploadUrl, filePath, token } = await requestUploadUrlAction(
          siteId,
          file.name,
          file.type
        )

        const controller = new AbortController()
        abortRefs.current.set(id, controller)

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("PUT", uploadUrl)
          xhr.setRequestHeader("Content-Type", file.type)

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100)
              updateUpload(id, { progress: pct })
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Network error during upload")))
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")))

          controller.signal.addEventListener("abort", () => xhr.abort())

          xhr.send(file)
        })

        const media = await completeUploadAction(siteId, filePath, token, metadata)
        updateUpload(id, { status: "complete", progress: 100 })
        onUploadComplete(media)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        if (message === "Upload cancelled") return
        updateUpload(id, { status: "error", error: message })
      } finally {
        abortRefs.current.delete(id)
      }
    },
    [siteId, updateUpload, onUploadComplete]
  )

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const errors: ValidationError[] = []
      const valid: File[] = []

      for (const file of files) {
        const error = validateFile(file, settings)
        if (error) {
          errors.push({ fileName: file.name, message: error })
        } else {
          valid.push(file)
        }
      }

      setValidationErrors((prev) => [...prev, ...errors])

      if (valid.length > 0) {
        const newUploads: UploadItem[] = valid.map((file) => ({
          id: uid(),
          file,
          fileName: file.name,
          progress: 0,
          status: "queued" as const,
        }))

        setUploads((prev) => [...prev, ...newUploads])

        for (const item of newUploads) {
          uploadFile(item.id, item.file)
        }
      }
    },
    [settings, uploadFile]
  )

  const handleCancel = useCallback((id: string) => {
    abortRefs.current.get(id)?.abort()
    updateUpload(id, { status: "error", error: "Cancelled" })
  }, [updateUpload])

  const handleRetry = useCallback(
    (id: string) => {
      const item = uploads.find((u) => u.id === id)
      if (item) uploadFile(id, item.file)
    },
    [uploads, uploadFile]
  )

  const handleDismiss = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const handleDismissError = useCallback((index: number) => {
    setValidationErrors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return (
    <div className="space-y-4">
      <UploadZone
        onFilesSelected={handleFilesSelected}
        acceptedTypes={[
          ...settings.allowedImageTypes,
          ...settings.allowedDocumentTypes,
          ...settings.allowedVideoTypes,
        ]}
      />
      <FileValidationFeedback
        issues={validationErrors}
        onDismiss={handleDismissError}
      />
      <UploadProgressList
        items={uploads}
        onCancel={handleCancel}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />
    </div>
  )
}
