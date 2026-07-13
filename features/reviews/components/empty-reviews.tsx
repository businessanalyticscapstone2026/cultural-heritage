import { Star } from "lucide-react"

export function EmptyReviews() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Star className="h-6 w-6 text-muted-foreground/40" />
      </div>
      <p className="mt-4 text-sm font-medium text-heading">
        No reviews yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Be the first to share your experience with this site.
      </p>
    </div>
  )
}
