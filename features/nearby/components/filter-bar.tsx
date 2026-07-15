"use client"

import { ChevronDown } from "lucide-react"
import type { TravelMode, HeritageCategory } from "@/types/heritage"
import { WALKING_RADII, DRIVING_RADII } from "@/features/nearby/constants"

interface FilterBarProps {
  mode: TravelMode
  radius: number
  onRadiusChange: (radius: number) => void
  categories: HeritageCategory[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  resultCount: number
}

export default function FilterBar({
  mode,
  radius,
  onRadiusChange,
  categories,
  selectedCategory,
  onCategoryChange,
  resultCount,
}: FilterBarProps) {
  const radii = mode === "driving" ? DRIVING_RADII : WALKING_RADII

  return (
    <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-warm-white pb-4 pt-1">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="appearance-none rounded-full border border-border bg-card px-4 py-2 pr-8 text-xs font-medium text-heading outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
          >
            {radii.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex flex-1 gap-2 overflow-x-auto" role="group" aria-label="Category filter">
          <button
            onClick={() => onCategoryChange(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === null
                ? "bg-primary text-white"
                : "border border-border bg-card text-muted-foreground hover:text-heading"
            }`}
            aria-pressed={selectedCategory === null}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.name)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat.name
                  ? "bg-primary text-white"
                  : "border border-border bg-card text-muted-foreground hover:text-heading"
              }`}
              aria-pressed={selectedCategory === cat.name}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted">
        {resultCount} heritage {resultCount === 1 ? "site" : "sites"} found within {radius} km
      </p>
    </div>
  )
}
