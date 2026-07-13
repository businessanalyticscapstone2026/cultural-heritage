"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPinIcon, StarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { HeritageSite } from "@/types/heritage"

interface HeritageCardProps {
  site: HeritageSite
  href?: string
}

export default function HeritageCard({ site, href }: HeritageCardProps) {
  const link = href ?? `/explore/${site.id}`
  const primaryImage = site.media.find((m) => m.isPrimary && m.mediaType === "image")
    ?? site.media.find((m) => m.mediaType === "image")

  return (
    <Link href={link} className="group block">
      <div className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.fileUrl}
              alt={site.siteName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          {site.category && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-background/80 backdrop-blur-sm" style={{ borderColor: site.category.color ?? undefined }}>
                {site.category.name}
              </Badge>
            </div>
          )}
          {site.averageRating > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm px-1.5 py-0.5 text-xs">
              <StarIcon className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              {site.averageRating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-1">
          <h3 className="font-heading text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {site.siteName}
          </h3>
          {site.municipalityName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinIcon className="h-3 w-3" />
              {site.municipalityName}
            </div>
          )}
          {site.shortDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2">{site.shortDescription}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
