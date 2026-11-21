"use client"

import { useMemo, useState } from "react"
import { Navigation, Star, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGisUiStore } from "../stores/gis-ui"
import type { SiteWithDistance } from "../hooks/use-nearby-sites"

interface NearbyDestinationsListProps {
  sites: SiteWithDistance[]
  onSiteClick: (site: SiteWithDistance) => void
  selectedSiteId: string | null
  routePlanningMode?: boolean
  routeStopIds?: string[]
}

const INITIAL_SHOW = 5

export default function NearbyDestinationsList({
  sites,
  onSiteClick,
  selectedSiteId,
  routePlanningMode,
  routeStopIds,
}: NearbyDestinationsListProps) {
  const { showNearbyPanel, setShowNearbyPanel } = useGisUiStore()
  const [showAll, setShowAll] = useState(false)

  const hasLocation = sites.some((s) => s.distanceKm != null)

  const displaySites = useMemo(
    () => (showAll ? sites : sites.slice(0, INITIAL_SHOW)),
    [sites, showAll],
  )

  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setShowNearbyPanel(!showNearbyPanel)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        <span className="flex items-center gap-1.5">
          <Navigation className="size-3" />
          Nearby Destinations
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            {sites.length}
          </span>
          {showNearbyPanel ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
        </span>
      </button>

      {showNearbyPanel && (
        <div className="pb-2">
          {!hasLocation && sites.length > 0 && (
            <p className="px-4 pb-1 text-[10px] text-ink-soft">
              Enable location access to see distances.
            </p>
          )}

          {sites.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-soft">
              No destinations match the current filters.
            </p>
          ) : (
            <ul className="space-y-0.5 px-2" role="listbox" aria-label="Nearby heritage sites">
              {displaySites.map((site) => {
                const inRoute = routeStopIds?.includes(site.id)
                return (
                  <li key={site.id} role="option" aria-selected={selectedSiteId === site.id}>
                    <button
                      type="button"
                      onClick={() => onSiteClick(site)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-parchment",
                        selectedSiteId === site.id && "bg-accent/10 font-medium",
                        inRoute && "bg-accent/5",
                      )}
                    >
                      {routePlanningMode ? (
                        <span
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
                            inRoute
                              ? "bg-accent text-white"
                              : "border border-ink/20 text-ink-soft hover:border-accent",
                          )}
                        >
                          {inRoute ? (
                            <svg className="size-2.5" viewBox="0 0 12 12" fill="currentColor">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                          ) : (
                            <Plus className="size-2.5" />
                          )}
                        </span>
                      ) : (
                        <span
                          className="inline-block size-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: site.categoryColor ?? "#6366f1",
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{site.siteName}</p>
                        <p className="truncate text-[10px] text-ink-soft">
                          {[site.barangay, site.municipalityName].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        {site.distanceKm != null && (
                          <span className="whitespace-nowrap text-[10px] font-medium text-accent">
                            {site.distanceKm < 1
                              ? `${(site.distanceKm * 1000).toFixed(0)}m`
                              : `${site.distanceKm.toFixed(1)}km`}
                          </span>
                        )}
                        {site.averageRating > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-ink-soft">
                            <Star className="size-2.5 fill-warning text-warning" />
                            {site.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {sites.length > INITIAL_SHOW && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="mt-1 flex w-full items-center justify-center gap-1 px-4 py-1.5 text-[10px] text-ink-soft hover:text-ink"
            >
              {showAll
                ? `Show top ${INITIAL_SHOW}`
                : `Show all ${sites.length} sites`}
              <ChevronDown
                className={cn("size-3 transition-transform", showAll && "rotate-180")}
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
