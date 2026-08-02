"use client"

import { useState } from "react"
import { Route, ChevronDown, ChevronRight, MapPin, Clock, Mountain } from "lucide-react"
import { useGisUiStore } from "../stores/gis-ui"
import type { CuratedTrail } from "../services/tourist-map"

interface CuratedTrailsPanelProps {
  trails: CuratedTrail[]
}

export default function CuratedTrailsPanel({ trails }: CuratedTrailsPanelProps) {
  const { showCuratedTrails, setShowCuratedTrails } = useGisUiStore()
  const [activeTrailId, setActiveTrailId] = useState<string | null>(null)

  const hasTrailData = trails.length > 0

  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setShowCuratedTrails(!showCuratedTrails)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        <span className="flex items-center gap-1.5">
          <Route className="size-3" />
          Curated Heritage Trails
        </span>
        {showCuratedTrails ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
      </button>

      {showCuratedTrails && (
        <div className="px-4 pb-3">
          {hasTrailData && (
            <div className="space-y-2">
              <p className="text-xs text-ink-soft">
                Select a pre-defined trail to highlight its stops on the map.
              </p>
              {trails.map((trail) => (
                <button
                  key={trail.id}
                  type="button"
                  onClick={() => setActiveTrailId(activeTrailId === trail.id ? null : trail.id)}
                  className="w-full rounded-xl border border-ink/10 bg-parchment/50 p-3 text-left transition-colors hover:bg-parchment"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink">{trail.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {trail.totalDistanceKm != null && (
                          <span className="flex items-center gap-1 text-[10px] text-ink-soft">
                            <Mountain className="size-3" />
                            {trail.totalDistanceKm.toFixed(1)} km
                          </span>
                        )}
                        {trail.totalDurationMinutes != null && (
                          <span className="flex items-center gap-1 text-[10px] text-ink-soft">
                            <Clock className="size-3" />
                            ~{trail.totalDurationMinutes} min
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] text-ink-soft">
                          <MapPin className="size-3" />
                          {trail.stops.length} stops
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`size-3.5 shrink-0 text-ink-soft transition-transform ${
                        activeTrailId === trail.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  {activeTrailId === trail.id && (
                    <ol className="mt-2 space-y-1 border-t border-ink/10 pt-2">
                      {trail.stops.map((stop) => (
                        <li key={stop.siteId} className="flex items-center gap-2 text-[11px] text-ink-soft">
                          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[9px] font-medium text-accent">
                            {stop.stopOrder}
                          </span>
                          <span className="truncate">{stop.siteName}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </button>
              ))}
            </div>
          )}

          {!hasTrailData && (
            <p className="px-1 py-2 text-xs text-ink-soft">
              No curated trails published yet. Check back as heritage staff add pre-defined routes.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
