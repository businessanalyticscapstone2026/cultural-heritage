"use client"

import { useMemo } from "react"
import { ChevronDown, ChevronRight, Landmark, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGisUiStore } from "../stores/gis-ui"
import { isPointInBounds } from "@/utils/geo"
import type { TouristMapSite, TouristMapCategory } from "../services/tourist-map"
import type { InventoryCoverage } from "@/features/municipalities/services/inventory-coverage"
import InventoryCoverageCard from "@/features/municipalities/components/inventory-coverage-card"

interface HeritageStatisticsProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  inventoryCoverage: InventoryCoverage | null
}

export default function HeritageStatistics({
  sites,
  categories,
  inventoryCoverage,
}: HeritageStatisticsProps) {
  const { mapBounds, showStatsPanel, setShowStatsPanel } = useGisUiStore()

  const stats = useMemo(() => {
    const visible = mapBounds
      ? sites.filter(
          (s) =>
            s.latitude != null &&
            s.longitude != null &&
            isPointInBounds(s.latitude, s.longitude, mapBounds),
        )
      : sites.filter((s) => s.latitude != null && s.longitude != null)

    const total = visible.length

    const byCategory = categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        count: visible.filter((s) => s.categoryId === cat.id).length,
      }))
      .filter((c) => c.count > 0)

    const byMunicipality: { name: string; count: number }[] = []
    const munMap = new Map<string, number>()
    for (const site of visible) {
      const name = site.municipalityName ?? "Unknown"
      munMap.set(name, (munMap.get(name) ?? 0) + 1)
    }
    for (const [name, count] of munMap) {
      byMunicipality.push({ name, count })
    }
    byMunicipality.sort((a, b) => b.count - a.count)

    return { total, byCategory, byMunicipality }
  }, [sites, categories, mapBounds])

  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={() => setShowStatsPanel(!showStatsPanel)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft hover:text-ink"
      >
        <span className="flex items-center gap-1.5">
          <Layers className="size-3" />
          Statistics
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            {stats.total} in view
          </span>
          {showStatsPanel ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          )}
        </span>
      </button>

      {showStatsPanel && (
        <div className="space-y-3 px-4 pb-3">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-ink-soft">
              Inventory Coverage
            </span>
            <InventoryCoverageCard coverage={inventoryCoverage} compact className="mt-1.5" />
          </div>

          {stats.total === 0 && (
            <p className="py-2 text-center text-xs text-ink-soft">
              No sites in the current view. Pan or zoom to explore.
            </p>
          )}

          {stats.byCategory.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-soft">
                By Category
              </span>
              <div className="mt-1 space-y-1">
                {stats.byCategory.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg px-2 py-1 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: cat.color ?? "#6366f1" }}
                      />
                      {cat.name}
                    </span>
                    <span className="font-medium text-ink">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.byMunicipality.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-soft">
                By Municipality
              </span>
              <div className="mt-1 space-y-1">
                {stats.byMunicipality.map((mun) => (
                  <div
                    key={mun.name}
                    className="flex items-center justify-between rounded-lg px-2 py-1 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <Landmark className="size-2.5 text-ink-soft" />
                      {mun.name}
                    </span>
                    <span className="font-medium text-ink">{mun.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
