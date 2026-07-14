"use client"

import { Star, Trash2, Replace, FileText, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "../constants"
import type { HeritageSiteMedia } from "@/types/heritage"

interface MediaCardProps {
  media: HeritageSiteMedia
  onSetPrimary: (mediaId: string) => void
  onDelete: (media: HeritageSiteMedia) => void
  onReplace: (media: HeritageSiteMedia) => void
}

export default function MediaCard({
  media,
  onSetPrimary,
  onDelete,
  onReplace,
}: MediaCardProps) {
  const isImage = media.mediaType === "image"

  return (
    <div className="group relative overflow-hidden rounded-lg border bg-card">
      <div className="aspect-square overflow-hidden bg-muted">
        {isImage ? (
          <img
            src={media.fileUrl}
            alt={media.fileName ?? "Heritage image"}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : media.mediaType === "video" ? (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <Video className="size-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Video</span>
          </div>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2">
            <FileText className="size-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Document</span>
          </div>
        )}
      </div>

      {media.isPrimary && (
        <div className="absolute left-2 top-2">
          <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
            <Star className="size-3 fill-current" />
            Primary
          </Badge>
        </div>
      )}

      <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        {!media.isPrimary && isImage && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetPrimary(media.id)}
            className="gap-1 text-xs"
          >
            <Star className="size-3" />
            Set primary
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between p-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{media.fileName ?? "Untitled"}</p>
          {media.fileSizeBytes !== null && (
            <p className="text-[10px] text-muted-foreground">
              {formatFileSize(media.fileSizeBytes)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onReplace(media)}
            aria-label={`Replace ${media.fileName ?? "media"}`}
          >
            <Replace className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(media)}
            aria-label={`Delete ${media.fileName ?? "media"}`}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
