"use client"

import { Landmark } from "lucide-react"
import type { HeritageCategory } from "@/types/heritage"

interface SitePreviewCardProps {
  siteName: string
  category: HeritageCategory | null
  shortDescription: string | null
  yearEstablished: string | null
  publicationStatus: string
  isFeatured: boolean
}

export default function SitePreviewCard({
  siteName,
  category,
  shortDescription,
  yearEstablished,
  publicationStatus,
  isFeatured,
}: SitePreviewCardProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <Landmark className="size-12 text-muted-foreground/60" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight truncate">
              {siteName || "Site Name"}
            </h3>
            {category && (
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: category.color ? `${category.color}15` : undefined,
                  borderColor: category.color ?? undefined,
                  color: category.color ?? undefined,
                }}
              >
                {category.name}
              </span>
            )}
          </div>
          {isFeatured && <span className="text-yellow-500 text-xs shrink-0">★</span>}
        </div>

        {shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2">{shortDescription}</p>
        )}

        {yearEstablished && (
          <p className="text-[10px] text-muted-foreground">Est. {yearEstablished}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              publicationStatus === "published"
                ? "bg-green-100 text-green-800"
                : publicationStatus === "archived"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {publicationStatus}
          </span>
        </div>
      </div>
    </div>
  )
}
