import { Star } from "lucide-react"

interface StarDisplayProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function StarDisplay({
  rating,
  size = "md",
  showValue = false,
}: StarDisplayProps) {
  const starSize = sizeMap[size]

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercent = Math.min(1, Math.max(0, rating - (star - 1)))

        return (
          <div key={star} className="relative">
            <Star className={`${starSize} fill-none text-muted-foreground/30`} />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercent * 100}%` }}
            >
              <Star className={`${starSize} fill-warning text-warning`} />
            </div>
          </div>
        )
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-heading">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
