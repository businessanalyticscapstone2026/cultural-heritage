"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value
  const starSize = sizeMap[size]

  const handleClick = (rating: number) => {
    if (readonly || !onChange) return
    onChange(rating)
  }

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (readonly || !onChange) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onChange(rating)
    }
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Rating: ${value} out of 5 stars` : "Select a rating"}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !readonly && setHoverValue(rating)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          onKeyDown={(e) => handleKeyDown(e, rating)}
          className={`transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer"
          }`}
          role={readonly ? undefined : "radio"}
          aria-checked={readonly ? undefined : value === rating}
          aria-label={`${rating} star${rating !== 1 ? "s" : ""}`}
          tabIndex={readonly ? -1 : 0}
        >
          <Star
            className={`${starSize} ${
              rating <= displayValue
                ? "fill-warning text-warning"
                : "fill-none text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
