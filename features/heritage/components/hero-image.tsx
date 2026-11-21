import Image from "next/image"
import { Camera } from "lucide-react"
import type { HeritageSiteMedia } from "../types"

interface HeroImageProps {
  media: HeritageSiteMedia[]
  siteName: string
  onViewAll?: () => void
}

export default function HeroImage({ media, siteName, onViewAll }: HeroImageProps) {
  const heroImage =
    media.find((m) => m.mediaType === "image" && m.isPrimary) ??
    media.find((m) => m.mediaType === "image")
  const imageCount = media.filter((m) => m.mediaType === "image").length

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl sm:h-[400px] lg:h-[500px]">
      {heroImage ? (
        <Image
          src={heroImage.fileUrl}
          alt={heroImage.caption ?? siteName}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-muted-foreground">No images available</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {imageCount > 1 && onViewAll && (
        <button
          onClick={onViewAll}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          aria-label={`View all ${imageCount} photos`}
        >
          <Camera className="h-4 w-4" />
          View all {imageCount} photos
        </button>
      )}
    </div>
  )
}
