"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ReviewMedia } from "@/types/review"

interface ReviewMediaGalleryProps {
  media: ReviewMedia[]
  authorLabel: string
}

export function ReviewMediaGallery({ media, authorLabel }: ReviewMediaGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  if (media.length === 0) return null

  const current = openIndex != null ? media[openIndex] : null
  const step = (delta: number) =>
    setOpenIndex((i) => (i == null ? i : (i + delta + media.length) % media.length))

  return (
    <>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Review photos and video">
        {media.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="relative block size-16 overflow-hidden rounded-lg border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-20"
              aria-label={`Open ${item.mediaType === "video" ? "video" : "photo"} ${index + 1} of ${media.length}`}
            >
              {item.mediaType === "image" ? (
                <Image src={item.fileUrl} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <>
                  <video src={item.fileUrl} preload="metadata" muted playsInline className="size-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                    <Play className="size-5" aria-hidden="true" />
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current != null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle>
            {current?.mediaType === "video" ? "Video" : "Photo"} {openIndex != null ? openIndex + 1 : ""} of{" "}
            {media.length}
          </DialogTitle>
          <DialogDescription>Shared by {authorLabel}</DialogDescription>
          {current && (
            <div className="relative flex max-h-[70vh] min-h-48 items-center justify-center overflow-hidden rounded-lg bg-black">
              {current.mediaType === "image" ? (
                <Image
                  src={current.fileUrl}
                  alt={`Photo ${(openIndex ?? 0) + 1} shared by ${authorLabel}`}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="h-auto max-h-[70vh] w-auto object-contain"
                />
              ) : (
                <video
                  key={current.id}
                  src={current.fileUrl}
                  controls
                  playsInline
                  className="max-h-[70vh] w-full"
                />
              )}
            </div>
          )}
          {media.length > 1 && (
            <div className="flex justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => step(-1)}>
                <ChevronLeft aria-hidden="true" /> Previous
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => step(1)}>
                Next <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
