"use client"

import { MapPin, Navigation } from "lucide-react"

interface LocationPromptProps {
  onEnableLocation: () => void
  onChooseManual: () => void
}

export default function LocationPrompt({ onEnableLocation, onChooseManual }: LocationPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Navigation className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mt-6 font-heading text-xl font-semibold text-heading">
        Find heritage sites near you
      </h2>

      <p className="mt-2 max-w-sm text-sm text-body">
        Allow location access to discover heritage sites closest to your current
        position in the First District of Batangas.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={onEnableLocation}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <MapPin className="h-4 w-4" />
          Enable Location
        </button>

        <button
          onClick={onChooseManual}
          className="text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
        >
          Choose location manually
        </button>
      </div>
    </div>
  )
}
