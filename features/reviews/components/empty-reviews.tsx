import { Star } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"

export function EmptyReviews() {
  return (
    <EmptyState
      icon={<Star size={24} strokeWidth={1.5} className="text-ink-soft/40" />}
      title="No reviews yet"
      description="Be the first to share your experience with this site."
    />
  )
}