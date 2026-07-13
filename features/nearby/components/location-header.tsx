"use client"

import { MapPin, Footprints, Car, RefreshCw } from "lucide-react"
import type { TravelMode } from "@/types/heritage"

interface LocationHeaderProps {
  latitude: number
  longitude: number
  locationLabel: string
  mode: TravelMode
  onModeChange: (mode: TravelMode) => void
  onChangeLocation: () => void
  onRefresh: () => void
}

export default function LocationHeader({
  latitude,
  longitude,
  locationLabel,
  mode,
  onModeChange,
  onChangeLocation,
  onRefresh,
}: LocationHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-heading">{locationLabel}</p>
          <p className="text-xs text-muted">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
        <button
          onClick={onChangeLocation}
          className="text-xs font-medium text-secondary transition-colors hover:text-secondary/80"
        >
          Change
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Refresh location"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        <div className="flex rounded-full border border-border bg-card p-0.5">
          <button
            onClick={() => onModeChange("walking")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "walking"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-heading"
            }`}
            aria-pressed={mode === "walking"}
          >
            <Footprints className="h-3.5 w-3.5" />
            Walking
          </button>
          <button
            onClick={() => onModeChange("driving")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === "driving"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-heading"
            }`}
            aria-pressed={mode === "driving"}
          >
            <Car className="h-3.5 w-3.5" />
            Driving
          </button>
        </div>
      </div>
    </div>
  )
}
