import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock } from "lucide-react"
import type { NearbySite } from "../types"

interface NearbySitesSidebarProps {
  sites: NearbySite[]
}

export default function NearbySitesSidebar({ sites }: NearbySitesSidebarProps) {
  if (sites.length === 0) return null

  return (
    <section
      aria-labelledby="nearby-heading"
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10">
          <MapPin className="h-4 w-4 text-secondary" />
        </div>
        <h2
          id="nearby-heading"
          className="font-heading text-lg font-semibold text-heading"
        >
          Nearby Sites
        </h2>
      </div>

      <ul className="mt-4 space-y-3">
        {sites.map((site) => (
          <li key={site.siteId}>
            <Link
              href={`/heritage/${site.siteId}`}
              className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              {site.thumbnail ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={site.thumbnail}
                    alt={site.siteName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-heading group-hover:text-primary">
                  {site.siteName}
                </p>
                {site.category && (
                  <p className="text-xs text-muted">{site.category}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span>{site.distanceKm.toFixed(1)} km</span>
                  {site.travelTimeMinutes !== null && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {site.travelTimeMinutes} min
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
