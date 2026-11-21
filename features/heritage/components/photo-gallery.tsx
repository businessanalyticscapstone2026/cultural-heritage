"use client"

import Image from "next/image"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import type { HeritageSiteMedia } from "../types"

interface PhotoGalleryProps {
  media: HeritageSiteMedia[]
  lightboxIndex: number | null
  onOpenLightbox: (index: number) => void
  onCloseLightbox: () => void
}

export default function PhotoGallery({
  media,
  lightboxIndex,
  onOpenLightbox,
  onCloseLightbox,
}: PhotoGalleryProps) {
  const images = media
    .filter((m) => m.mediaType === "image")
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return 0
    })

  if (images.length === 0) return null

  return (
    <section aria-labelledby="gallery-heading">
      <h2
        id="gallery-heading"
        className="font-heading text-lg font-semibold text-heading"
      >
        Photo Gallery
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => onOpenLightbox(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border"
            aria-label={`View photo ${i + 1}${img.caption ? `: ${img.caption}` : ""}`}
          >
            <Image
              src={img.fileUrl}
              alt={img.caption ?? `Photo ${i + 1}`}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading={i < 6 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            role="dialog"
            aria-modal="true"
            aria-label="Photo lightbox"
          >
            <button
              onClick={onCloseLightbox}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close lightbox"
              autoFocus
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative h-[80vh] w-[90vw] max-w-5xl">
              <Image
                src={images[lightboxIndex].fileUrl}
                alt={images[lightboxIndex].caption ?? `Photo ${lightboxIndex + 1}`}
                fill
                unoptimized
                className="object-contain"
                sizes="90vw"
              />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
              {lightboxIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    onOpenLightbox(
                      lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() =>
                    onOpenLightbox(
                      lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0
                    )
                  }
                  className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
