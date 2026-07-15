"use client"

import Image from "next/image"
import Link from "next/link"
import { Navigation, Clock, ArrowDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { RouteStop } from "../types"

interface RouteStopListProps {
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMin: number
  hasEstimatedEdges: boolean
}

export default function RouteStopList({
  stops,
  totalDistanceKm,
  totalDurationMin,
  hasEstimatedEdges,
}: RouteStopListProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <dl className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Stops</dt>
            <dd className="text-lg font-bold text-heading">{stops.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Total Distance</dt>
            <dd className="text-lg font-bold text-heading">{totalDistanceKm} km</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Est. Duration</dt>
            <dd className="text-lg font-bold text-heading">{totalDurationMin} min</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Status</dt>
            <dd className="text-lg font-bold text-heading">
              {hasEstimatedEdges ? (
                <span className="flex items-center justify-center gap-1">
                  Estimated
                  <Badge variant="outline" className="text-[10px]">Some edges estimated</Badge>
                </span>
              ) : (
                <span className="text-success">Precise</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Turn-by-Turn Notice */}
      <div
        role="alert"
        className="rounded-xl border border-warning/30 bg-warning/5 p-3 text-xs text-body"
      >
        <strong className="text-heading">Turn-by-turn navigation:</strong> The database stores only
        aggregate distance and time between heritage sites, not step-by-step driving or walking
        directions. To get true turn-by-turn navigation, integrate an external routing API such as
        Google Directions (listed in the project integrations for Google Maps Platform). Until then,
        distances shown are straight-line (Haversine) estimates, and &ldquo;travel time&rdquo; is calculated at
        ~40 km/h average speed plus a buffer.
      </div>

      {/* Accessible ordered stop list */}
      <nav aria-label="Route stops">
        <ol className="space-y-3">
          {stops.map((stop, index) => (
            <li key={stop.siteId}>
              <div className="group relative flex items-start gap-4 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md">
                {/* Stop number indicator */}
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white"
                    aria-hidden="true"
                  >
                    {stop.stopOrder}
                  </span>
                  {index < stops.length - 1 && (
                    <div className="mt-1 h-full w-px bg-border" aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/heritage/${stop.siteId}`}
                        className="text-sm font-semibold text-heading hover:text-secondary"
                      >
                        {stop.siteName}
                      </Link>
                      {stop.municipalityName && (
                        <p className="text-xs text-muted">{stop.municipalityName}</p>
                      )}
                    </div>

                    {stop.thumbnail && (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={stop.thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body">
                    {stop.distanceFromPrevKm !== null && (
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3 text-secondary" />
                        {stop.distanceFromPrevKm} km {index === 0 ? "from start" : "from previous"}
                      </span>
                    )}

                    {stop.travelTimeFromPrevMin !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-secondary" />
                        ~{stop.travelTimeFromPrevMin} min
                      </span>
                    )}

                    {stop.edgeIsEstimated && (
                      <Badge variant="outline" className="text-[10px]">Estimated</Badge>
                    )}
                  </div>

                  {stop.estimatedArrival && (
                    <p className="mt-1 text-[10px] text-muted" aria-label={`Estimated arrival time: ${new Date(stop.estimatedArrival).toLocaleTimeString()}`}>
                      Arrival: {new Date(stop.estimatedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector arrow between stops (visually decorative) */}
              {index < stops.length - 1 && (
                <div className="flex justify-center py-1" aria-hidden="true">
                  <ArrowDown className="h-4 w-4 text-muted" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
