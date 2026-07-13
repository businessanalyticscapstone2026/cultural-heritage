"use client"

import type { ReviewSortOption } from "@/types/review"

interface SortControlProps {
  value: ReviewSortOption
  onChange: (sort: ReviewSortOption) => void
}

const options: { value: ReviewSortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "highest", label: "Highest Rated" },
  { value: "lowest", label: "Lowest Rated" },
]

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Sort by</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              value === opt.value
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
