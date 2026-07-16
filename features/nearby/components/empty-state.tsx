import Link from "next/link"
import { MapPinOff, Maximize } from "lucide-react"

interface EmptyStateProps {
  radius: number
  onExpandRadius: () => void
}

export default function EmptyState({ radius, onExpandRadius }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <MapPinOff className="h-7 w-7 text-muted-foreground" />
      </div>

      <h3 className="mt-5 font-heading text-lg font-semibold text-heading">
        No heritage sites found
      </h3>

      <p className="mt-2 max-w-sm text-sm text-body">
        There are no heritage sites within {radius} km of your current location.
        Try expanding your search radius or browse all heritage sites.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onExpandRadius}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Maximize className="h-4 w-4" />
          Expand search
        </button>
        <Link
          href="/explore"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-muted"
        >
          Browse all sites
        </Link>
      </div>
    </div>
  )
}
