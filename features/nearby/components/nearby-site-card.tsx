"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock } from "lucide-react"
import type { NearbySite, TravelMode } from "@/types/heritage"

interface NearbySiteCardProps {
  site: NearbySite
  mode: TravelMode
}

export default function NearbySiteCard({ site, mode }: NearbySiteCardProps) {
  const modeLabel = mode === "walking" ? "walk" : "drive"

  return (
    <Link
      href={`/heritage/${site.siteId}`}
      className="group flex items-start gap-4 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
    >
      {site.thumbnail ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={site.thumbnail}
            alt={site.siteName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
          <MapPin className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-heading group-hover:text-primary">
            {site.siteName}
          </p>
          <p className="shrink-0 text-sm font-bold text-heading">
            {site.distanceKm.toFixed(1)} km
          </p>
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          {site.category && <span>{site.category}</span>}
          {site.category && site.travelTimeMinutes !== null && <span>·</span>}
          {site.travelTimeMinutes !== null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{site.travelTimeMinutes} min {modeLabel}
            </span>
          )}
        </div>

        {site.municipalityName && (
          <p className="mt-0.5 text-xs text-muted">{site.municipalityName}</p>
        )}
      </div>
    </Link>
  )
}
