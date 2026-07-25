"use client"

import { FolderOpen } from "lucide-react"
import MediaCard from "./media-card"
import type { HeritageSiteMedia } from "@/types/heritage"

interface MediaGridProps {
  media: HeritageSiteMedia[]
  onSetPrimary: (mediaId: string) => void
  onDelete: (media: HeritageSiteMedia) => void
  onReplace: (media: HeritageSiteMedia) => void
  onReorder: (mediaId: string, direction: "up" | "down") => void
}

export default function MediaGrid({
  media,
  onSetPrimary,
  onDelete,
  onReplace,
  onReorder,
}: MediaGridProps) {
  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="mb-3 size-10 text-muted-foreground/70" />
        <p className="text-sm text-muted-foreground">No media uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {media.map((item, idx) => (
        <MediaCard
          key={item.id}
          media={item}
          isFirst={idx === 0}
          isLast={idx === media.length - 1}
          onSetPrimary={onSetPrimary}
          onDelete={onDelete}
          onReplace={onReplace}
          onReorder={onReorder}
        />
      ))}
    </div>
  )
}
