"use client"

import { useState } from "react"
import { MapPin, ChevronDown } from "lucide-react"
import {
  FIRST_DISTRICT_MUNICIPALITIES,
  MUNICIPALITY_COORDINATES,
} from "@/lib/constants"

interface LocationFallbackProps {
  onSelect: (lat: number, long: number, label: string) => void
  onCancel: () => void
}

export default function LocationFallback({ onSelect, onCancel }: LocationFallbackProps) {
  const [selected, setSelected] = useState<string>("")

  const handleConfirm = () => {
    if (!selected) return
    const coords = MUNICIPALITY_COORDINATES[selected]
    if (coords) {
      onSelect(coords.lat, coords.long, selected)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
        <MapPin className="h-6 w-6 text-secondary" />
      </div>

      <h2 className="mt-4 font-heading text-lg font-semibold text-heading">
        Select your location
      </h2>

      <p className="mt-1 max-w-sm text-sm text-body">
        Choose a municipality in the First District of Batangas to find nearby
        heritage sites.
      </p>

      <div className="relative mt-6 w-full max-w-xs">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-3 pr-10 text-sm text-heading outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
        >
          <option value="">Select municipality</option>
          {[...FIRST_DISTRICT_MUNICIPALITIES].map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Use this location
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
