"use client"

import { useMemo } from "react"
import { Map as MapIcon, Landmark, Locate, ChevronRight } from "lucide-react"
import { useGisUiStore } from "../stores/gis-ui"
import type { TouristMapSite, TouristMapCategory } from "../services/tourist-map"

interface SiteWithEntry extends TouristMapSite {
  distanceKm: number | null
}

interface MapEntryStateProps {
  sites: SiteWithEntry[]
  categories: TouristMapCategory[]
  hasUserLocation: boolean
  onCenterOnLocation: () => void
  onExplore: () => void
}

function computeCategoryBreakdown(
  sites: SiteWithEntry[],
  categories: TouristMapCategory[],
): { id: string; name: string; color: string | null; count: number }[] {
  return categories
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      count: sites.filter(
        (s) => s.categoryId === cat.id && s.latitude != null && s.longitude != null,
      ).length,
    }))
    .filter((c) => c.count > 0)
}

export default function MapEntryState({
  sites,
  categories,
  hasUserLocation,
  onCenterOnLocation,
  onExplore,
}: MapEntryStateProps) {
  const showEntryState = useGisUiStore((s) => s.showEntryState)

  const totalSites = useMemo(
    () => sites.filter((s) => s.latitude != null && s.longitude != null).length,
    [sites],
  )

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(sites, categories),
    [sites, categories],
  )

  const municipalityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const site of sites) {
      if (site.latitude == null || site.longitude == null) continue
      const name = site.municipalityName ?? "Unknown"
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [sites])

  if (!showEntryState) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-2xl border border-ink/10 bg-cream/95 shadow-2xl backdrop-blur-md">
          <div className="px-6 pb-2 pt-6">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <MapIcon className="size-3" />
              Interactive GIS Atlas
            </div>
            <h2 className="text-display text-2xl leading-tight text-ink">
              Heritage Map — First District of Batangas
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              {totalSites} heritage site{totalSites !== 1 ? "s" : ""} across{" "}
              {municipalityMap.length} municipalit{municipalityMap.length !== 1 ? "ies" : "y"}
              {sites.length > totalSites && ` · ${sites.length - totalSites} more not yet pinned`}
            </p>
          </div>

          {totalSites > 0 && categoryBreakdown.length > 0 && (
            <div className="space-y-3 px-6 py-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                  By Category
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {categoryBreakdown.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                      style={{
                        borderColor: cat.color ?? "#6366f1",
                        backgroundColor: cat.color ? `${cat.color}15` : undefined,
                      }}
                    >
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: cat.color ?? "#6366f1" }}
                      />
                      {cat.name}
                      <span className="font-medium text-ink">{cat.count}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                  By Municipality
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {municipalityMap.map(([name, count]) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 rounded-full bg-parchment/70 px-2.5 py-1 text-xs text-ink-soft"
                    >
                      <Landmark className="size-2.5" />
                      {name}
                      <span className="font-medium text-ink">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {totalSites === 0 && (
            <div className="px-6 py-4">
              <p className="text-center text-sm text-ink-soft">
                No heritage sites published yet. Check back as municipalities add their data.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 px-6 py-4">
            {hasUserLocation && (
              <button
                type="button"
                onClick={() => {
                  onCenterOnLocation()
                  onExplore()
                }}
                className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent/90"
              >
                <Locate className="size-3.5" />
                Center on my location
              </button>
            )}

            <button
              type="button"
              onClick={onExplore}
              className="flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-ink/90"
            >
              Explore the map
              <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
