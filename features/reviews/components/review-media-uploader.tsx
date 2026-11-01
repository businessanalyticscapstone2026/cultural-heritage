"use client"

import { useRef } from "react"
import Image from "next/image"
import { AlertCircle, ImagePlus, Loader2, RotateCcw, Video, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { REVIEW_MEDIA_LIMITS } from "../constants"
import { formatMegabytes } from "../utils/review-media-validation"
import type { ReviewMediaItem } from "../hooks/use-review-media-upload"

interface ReviewMediaUploaderProps {
  items: ReviewMediaItem[]
  rejections: string[]
  error?: string
  onAddFiles: (files: File[]) => void
  onRetry: (localId: string) => void
  onRemove: (localId: string) => void
}

const ACCEPT = [...REVIEW_MEDIA_LIMITS.image.mimeTypes, ...REVIEW_MEDIA_LIMITS.video.mimeTypes].join(",")

function MediaTile({
  item,
  onRetry,
  onRemove,
}: {
  item: ReviewMediaItem
  onRetry: () => void
  onRemove: () => void
}) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
      {item.mediaType === "image" ? (
        <Image
          src={item.previewUrl}
          alt={item.fileName}
          fill
          sizes="120px"
          unoptimized={item.isLocalPreview}
          className="object-cover"
        />
      ) : (
        <video
          src={item.previewUrl}
          className="size-full object-cover"
          preload="metadata"
          muted
          playsInline
          controls
          aria-label={item.fileName}
        />
      )}

      {item.mediaType === "video" && (
        <span className="pointer-events-none absolute left-1 top-1 rounded bg-black/60 p-0.5 text-white">
          <Video className="size-3" aria-hidden="true" />
        </span>
      )}

      {item.status === "uploading" && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-1 text-white">
          <div className="flex items-center gap-1 text-[10px]">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            <span>{item.progress}%</span>
          </div>
          <progress
            className="mt-0.5 h-1 w-full overflow-hidden rounded accent-primary"
            value={item.progress}
            max={100}
            aria-label={`Uploading ${item.fileName}`}
          />
        </div>
      )}

      {item.status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-destructive/80 p-1 text-center text-white">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span className="line-clamp-2 text-[10px]" role="alert">
            {item.error ?? "Upload failed"}
          </span>
          {item.file && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-0.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <RotateCcw className="size-3" aria-hidden="true" /> Retry
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.fileName}`}
        className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  )
}

export function ReviewMediaUploader({
  items,
  rejections,
  error,
  onAddFiles,
  onRetry,
  onRemove,
}: ReviewMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const imageCount = items.filter((i) => i.mediaType === "image").length
  const videoCount = items.filter((i) => i.mediaType === "video").length
  const isFull =
    imageCount >= REVIEW_MEDIA_LIMITS.image.maxCount && videoCount >= REVIEW_MEDIA_LIMITS.video.maxCount

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span id="review-media-label" className="text-sm font-medium text-heading">
          Photos &amp; video <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {imageCount}/{REVIEW_MEDIA_LIMITS.image.maxCount} photos · {videoCount}/
          {REVIEW_MEDIA_LIMITS.video.maxCount} video
        </span>
      </div>

      <ul
        aria-labelledby="review-media-label"
        className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6"
      >
        {items.map((item) => (
          <MediaTile
            key={item.localId}
            item={item}
            onRetry={() => onRetry(item.localId)}
            onRemove={() => onRemove(item.localId)}
          />
        ))}
        {!isFull && (
          <li className="aspect-square">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex size-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <ImagePlus className="size-5" aria-hidden="true" />
              <span className="text-[11px] font-medium">Add media</span>
            </button>
          </li>
        )}
      </ul>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ""
          if (files.length > 0) onAddFiles(files)
        }}
      />

      <p className="text-xs text-muted-foreground">
        JPEG, PNG or WebP photos up to {formatMegabytes(REVIEW_MEDIA_LIMITS.image.maxBytes)}; MP4 or MOV
        video up to {formatMegabytes(REVIEW_MEDIA_LIMITS.video.maxBytes)}.
      </p>

      {(rejections.length > 0 || error) && (
        <ul className="space-y-0.5" role="alert">
          {rejections.map((message) => (
            <li key={message} className="text-xs text-destructive">
              {message}
            </li>
          ))}
          {error && <li className="text-xs text-destructive">{error}</li>}
        </ul>
      )}
    </div>
  )
}
