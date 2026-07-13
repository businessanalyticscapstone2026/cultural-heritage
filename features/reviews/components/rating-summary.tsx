import type { ReviewAggregate } from "@/types/review"
import { StarDisplay } from "./star-display"

interface RatingSummaryProps {
  aggregate: ReviewAggregate
  distribution?: number[]
}

export function RatingSummary({
  aggregate,
  distribution = [0, 0, 0, 0, 0],
}: RatingSummaryProps) {
  const total = aggregate.reviewCount

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-6">
        <div className="text-center">
          <p className="font-heading text-4xl font-bold text-heading">
            {aggregate.averageRating > 0
              ? aggregate.averageRating.toFixed(1)
              : "—"}
          </p>
          <StarDisplay
            rating={aggregate.averageRating}
            size="md"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star - 1] ?? 0
            const pct = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-right text-xs text-muted-foreground">
                  {star}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
