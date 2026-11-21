"use client"

import Image from "next/image"
import { MapPin, Clock, Map, Footprints, Car } from "lucide-react"
import RestrictedLink from "@/components/auth/restricted-link"
import type { NearbySite, TravelMode } from "../types"

interface NearbySitesSidebarProps {
  sites: NearbySite[]
  mode: TravelMode
  onModeChange: (mode: TravelMode) => void
  selectedSiteId: string | null
  onSiteSelect: (siteId: string | null) => void
}

export default function NearbySitesSidebar({
  sites,
  mode,
  onModeChange,
  selectedSiteId,
  onSiteSelect,
}: NearbySitesSidebarProps) {
  if (sites.length === 0) return null

  return (
    <section
      aria-labelledby="nearby-heading"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
            <MapPin className="h-4 w-4 text-secondary" />
          </div>
          <h2
            id="nearby-heading"
            className="font-heading text-lg font-semibold text-heading"
          >
            Nearby Sites
          </h2>
        </div>
        <span className="text-xs text-muted">
          {sites.length} site{sites.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex rounded-full border border-border bg-card p-0.5"
          role="group"
          aria-label="Travel mode"
        >
          <button
            onClick={() => onModeChange("walking")}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "walking"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-heading"
            }`}
            aria-pressed={mode === "walking"}
          >
            <Footprints className="h-3 w-3" />
            Walk
          </button>
          <button
            onClick={() => onModeChange("driving")}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              mode === "driving"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-heading"
            }`}
            aria-pressed={mode === "driving"}
          >
            <Car className="h-3 w-3" />
            Drive
          </button>
        </div>

        <RestrictedLink
          href={`/map?site=${sites[0]?.siteId ?? ""}`}
          title="Sign in to view the map"
          description="Explore heritage sites across the First District of Batangas with our interactive GIS map."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-heading"
        >
          <Map className="h-3 w-3" />
          View on Map
        </RestrictedLink>
      </div>

      <ul className="mt-3 space-y-1">
        {sites.map((site) => {
          const isSelected = selectedSiteId === site.siteId
          return (
            <li key={site.siteId}>
              <button
                onClick={() => onSiteSelect(isSelected ? null : site.siteId)}
                className={`group flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors ${
                  isSelected ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted"
                }`}
                onMouseEnter={() => onSiteSelect(site.siteId)}
                onMouseLeave={() => {
                  if (!isSelected) onSiteSelect(null)
                }}
              >
                {site.thumbnail ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={site.thumbnail}
                      alt={site.siteName}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isSelected ? "text-primary" : "text-heading group-hover:text-primary"}`}>
                    {site.siteName}
                  </p>
                  {site.category && (
                    <p className="text-xs text-muted">{site.category}</p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                    <span>{site.distanceKm.toFixed(1)} km</span>
                    {site.travelTimeMinutes !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {site.travelTimeMinutes} min
                      </span>
                    )}
                    {site.municipalityName && (
                      <span className="truncate">{site.municipalityName}</span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {sites.length > 0 && (
        <RestrictedLink
          href="/nearby"
          title="Sign in to view nearby sites"
          description="Discover heritage sites closest to you in the First District of Batangas."
          className="mt-3 block text-center text-xs font-medium text-primary hover:underline"
        >
          Explore more nearby sites
        </RestrictedLink>
      )}
    </section>
  )
}
