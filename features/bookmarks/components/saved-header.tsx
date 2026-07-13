"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface SavedHeaderProps {
  count: number
  municipalities: string[]
  categories: string[]
  onMunicipalityFilter: (value: string | null) => void
  onCategoryFilter: (value: string | null) => void
  activeMunicipality: string | null
  activeCategory: string | null
}

export function SavedHeader({
  count,
  municipalities,
  categories,
  onMunicipalityFilter,
  onCategoryFilter,
  activeMunicipality,
  activeCategory,
}: SavedHeaderProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-heading">
            Saved Sites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} {count === 1 ? "site" : "sites"} saved
          </p>
        </div>
        {(municipalities.length > 0 || categories.length > 0) && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-heading"
          >
            Filter
            <ChevronDown className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onMunicipalityFilter(null)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeMunicipality === null
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All municipalities
          </button>
          {municipalities.map((m) => (
            <button
              key={m}
              onClick={() => onMunicipalityFilter(m)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activeMunicipality === m
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {m}
            </button>
          ))}

          <div className="w-px bg-border" />

          <button
            onClick={() => onCategoryFilter(null)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeCategory === null
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryFilter(c)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activeCategory === c
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
