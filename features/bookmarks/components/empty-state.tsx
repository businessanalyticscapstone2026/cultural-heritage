import Link from "next/link"
import { Bookmark, Compass, MapPin } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Bookmark className="size-8 text-muted-foreground/40" />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold text-heading">
        No saved sites yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Bookmark heritage sites you&apos;re interested in and they&apos;ll appear here for easy access later.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Compass className="size-4" />
          Explore Heritage Sites
        </Link>
        <Link
          href="/tourist/nearby"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-heading transition-colors hover:bg-muted"
        >
          <MapPin className="size-4" />
          Nearby Attractions
        </Link>
      </div>
    </div>
  )
}
