"use client"

import { Footprints, Car, ChevronDown } from "lucide-react"
import type { TravelMode } from "@/types/heritage"

interface NearbyRadiusControlProps {
  mode: TravelMode
  radius: number
  radii: readonly number[]
  onModeChange: (mode: TravelMode) => void
  onRadiusChange: (radius: number) => void
  compact?: boolean
}

export default function NearbyRadiusControl({
  mode,
  radius,
  radii,
  onModeChange,
  onRadiusChange,
  compact = false,
}: NearbyRadiusControlProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex rounded-full border border-border bg-card p-0.5"
        role="group"
        aria-label="Travel mode"
      >
        <button
          onClick={() => onModeChange("walking")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            mode === "walking"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-heading"
          }`}
          aria-pressed={mode === "walking"}
        >
          <Footprints className="size-3" />
          {!compact && "Walk"}
        </button>
        <button
          onClick={() => onModeChange("driving")}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            mode === "driving"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-heading"
          }`}
          aria-pressed={mode === "driving"}
        >
          <Car className="size-3" />
          {!compact && "Drive"}
        </button>
      </div>

      <div className="relative">
        <select
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="appearance-none rounded-full border border-border bg-card px-3 py-1 pr-7 text-xs font-medium text-heading outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        >
          {radii.map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  )
}
