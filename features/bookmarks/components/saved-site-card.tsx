"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Trash2 } from "lucide-react"
import type { SavedSite } from "@/types/heritage"

interface SavedSiteCardProps {
  site: SavedSite
  onRemove: (siteId: string) => void
}

export function SavedSiteCard({ site, onRemove }: SavedSiteCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/heritage/${site.siteId}`} className="block">
        <div className="relative aspect-[4/3]">
          {site.thumbnail ? (
            <Image
              src={site.thumbnail}
              alt={site.siteName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted">
              <MapPin className="size-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
            {site.categoryName ?? "Heritage Site"}
          </p>
          <h3 className="mt-1 truncate font-semibold text-heading">
            {site.siteName}
          </h3>
          {site.municipalityName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {site.municipalityName}
            </p>
          )}
        </div>
      </Link>
      <div className="flex border-t px-4 py-2">
        <button
          onClick={() => onRemove(site.siteId)}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-3" />
          Remove
        </button>
      </div>
    </div>
  )
}
