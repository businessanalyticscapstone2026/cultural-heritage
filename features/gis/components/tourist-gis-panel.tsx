"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Map as MapIcon,
  Landmark,
  Layers,
  Search,
  X,
  ExternalLink,
  MapPin,
  Navigation,
  Star,
  Loader2,
  Locate,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useGisUiStore } from "../stores/gis-ui"
import { useNearbySites } from "../hooks/use-nearby-sites"
import type { TouristMapSite, TouristMapCategory } from "../services/tourist-map"
import type { SiteWithDistance } from "../hooks/use-nearby-sites"
import type { User } from "@supabase/supabase-js"

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Loading map...
      </div>
    ),
  },
)
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
)
const MarkerContent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
)
const MarkerLabel = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerLabel),
  { ssr: false },
)
const MapControls = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapControls),
  { ssr: false },
)
const MapPopup = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapPopup),
  { ssr: false },
)

interface TouristGISPanelProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  user: User | null
  homeLatitude: number | null
  homeLongitude: number | null
  userLatitude: number | null
  userLongitude: number | null
  locationSource: "browser" | "profile" | "none"
}

export default function TouristGISPanel({
  sites,
  categories,
  userLatitude,
  userLongitude,
}: TouristGISPanelProps) {
  const {
    selectedSiteId,
    isDetailOpen,
    categoryFilter,
    searchQuery,
    visibleCategoryIds,
    openDetail,
    closeDetail,
    setCategoryFilter,
    setSearchQuery,
    setVisibleCategoryIds,
  } = useGisUiStore()

  const [selectedSite, setSelectedSite] = useState<SiteWithDistance | null>(null)
  const [showFilters, setShowFilters] = useState(true)

  const nearbySites = useNearbySites(sites, userLatitude, userLongitude)
  const hasLocation = userLatitude != null && userLongitude != null

  const categoryIds = useMemo(() => categories.map((c) => c.id), [categories])

  const filteredSites = useMemo(
    () =>
      nearbySites.filter((s) => {
        if (categoryFilter !== "all" && s.categoryId !== categoryFilter) return false
        if (
          visibleCategoryIds.length > 0 &&
          !visibleCategoryIds.includes(s.categoryId ?? "")
        )
          return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          if (
            !s.siteName.toLowerCase().includes(q) &&
            !(s.barangay ?? "").toLowerCase().includes(q) &&
            !(s.municipalityName ?? "").toLowerCase().includes(q)
          )
            return false
        }
        return true
      }),
    [nearbySites, categoryFilter, visibleCategoryIds, searchQuery],
  )

  const handleSiteClick = useCallback(
    (site: SiteWithDistance) => {
      setSelectedSite(site)
      openDetail(site.id)
    },
    [openDetail],
  )

  const handleCloseDetail = useCallback(() => {
    setSelectedSite(null)
    closeDetail()
  }, [closeDetail])

  const hasCoordinates = filteredSites.length > 0
  const mapCenter: [number, number] =
    userLatitude != null && userLongitude != null
      ? [userLongitude, userLatitude]
      : hasCoordinates
        ? [filteredSites[0].longitude, filteredSites[0].latitude]
        : [120.78, 13.92]

  const hasUserMarker = userLatitude != null && userLongitude != null

  const getDirectionsUrl = (lat: number, lng: number) => {
    if (userLatitude != null && userLongitude != null) {
      return `https://www.google.com/maps/dir/${userLatitude},${userLongitude}/${lat},${lng}`
    }
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Filter / Site List Sidebar */}
      <aside
        className={cn(
          "flex w-80 shrink-0 flex-col border-r border-border bg-card transition-all duration-300",
          "max-lg:fixed max-lg:inset-y-16 max-lg:left-0 max-lg:z-30 max-lg:w-full max-lg:max-w-sm max-lg:shadow-xl",
          "max-md:-translate-x-full max-md:data-open:translate-x-0",
        )}
        data-open={showFilters ? "true" : undefined}
        aria-label="Map sidebar with site list and filters"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <MapIcon className="size-4 text-primary" />
            Heritage Map
          </h2>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-1.5 pl-8 pr-3 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Search heritage sites"
            />
          </div>
        </div>

        {/* User location indicator */}
        {hasLocation && (
          <div className="border-b border-border bg-primary/5 px-4 py-2">
            <p className="flex items-center gap-1.5 text-[11px] text-primary">
              <Locate className="size-3" />
              Showing distances from your location
            </p>
          </div>
        )}

        {!hasLocation && (
          <div className="border-b border-border bg-warning/5 px-4 py-2">
            <p className="text-[11px] text-warning">
              Enable location access or set a home location to see distances.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="border-b border-border p-3">
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.siteCount})
                </option>
              ))}
            </select>
          </div>

          {/* Category legend / layer toggles */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Layers className="mr-1 inline size-3" />
                Legend
              </span>
              <button
                type="button"
                onClick={() => {
                  setVisibleCategoryIds(
                    visibleCategoryIds.length === categories.length
                      ? []
                      : categories.map((c) => c.id),
                  )
                }}
                className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {visibleCategoryIds.length === categories.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="space-y-1" role="group" aria-label="Category legend">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={visibleCategoryIds.includes(cat.id)}
                    onChange={(e) => {
                      setVisibleCategoryIds(
                        e.target.checked
                          ? [...visibleCategoryIds, cat.id]
                          : visibleCategoryIds.filter((id) => id !== cat.id),
                      )
                    }}
                    className="size-3.5 accent-primary"
                  />
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#6366f1" }}
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.siteCount}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Site List (accessible keyboard/screen-reader alternative to map) */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Heritage Sites
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {filteredSites.length}
            </Badge>
          </div>

          {filteredSites.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No sites match the current filters.
            </p>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Heritage sites list">
              {filteredSites.map((site) => (
                <li key={site.id} role="option" aria-selected={selectedSiteId === site.id}>
                  <button
                    type="button"
                    onClick={() => handleSiteClick(site)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent",
                      selectedSiteId === site.id && "bg-primary/10 font-medium",
                    )}
                  >
                    <span
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: site.categoryColor ?? "#6366f1",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-heading">{site.siteName}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {[site.barangay, site.municipalityName].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      {site.distanceKm != null && (
                        <span className="whitespace-nowrap text-[10px] font-medium text-primary">
                          {site.distanceKm < 1
                            ? `${(site.distanceKm * 1000).toFixed(0)}m`
                            : `${site.distanceKm.toFixed(1)}km`}
                        </span>
                      )}
                      {site.averageRating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Star className="size-2.5 fill-warning text-warning" />
                          {site.averageRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setShowFilters(true)}
        className={cn(
          "fixed bottom-4 left-4 z-20 rounded-full bg-primary p-3 text-white shadow-lg transition-all hover:bg-primary/90 lg:hidden",
          showFilters && "hidden",
        )}
        aria-label="Open filters and site list"
      >
        <MapIcon className="size-5" />
      </button>

      {/* Main Map Area */}
      <div className="relative flex-1">
        <Map
          className="h-full w-full"
          viewport={{
            center: mapCenter,
            zoom: hasUserMarker ? 11 : 10,
            bearing: 0,
            pitch: 0,
          }}
        >
          {/* User location marker */}
          {hasUserMarker && (
            <MapMarker
              longitude={userLongitude}
              latitude={userLatitude}
            >
              <MarkerContent>
                <div className="relative flex size-6 items-center justify-center">
                  <div className="absolute size-6 animate-ping rounded-full bg-secondary/30" />
                  <div className="size-3 rounded-full border-2 border-white bg-secondary shadow-lg" />
                </div>
              </MarkerContent>
              <MarkerLabel position="bottom">You</MarkerLabel>
            </MapMarker>
          )}

          {/* Site markers */}
          {filteredSites
            .filter((s) => s.latitude != null && s.longitude != null)
            .map((site) => (
              <MapMarker
                key={site.id}
                longitude={site.longitude}
                latitude={site.latitude}
                onClick={() => handleSiteClick(site)}
              >
                <MarkerContent>
                  <button
                    type="button"
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                      selectedSiteId === site.id && "scale-125 ring-2 ring-primary",
                    )}
                    style={{
                      backgroundColor: site.categoryColor ?? "#6366f1",
                    }}
                    title={site.siteName}
                    aria-label={`${site.siteName}${site.distanceKm != null ? `, ${site.distanceKm < 1 ? `${(site.distanceKm * 1000).toFixed(0)}m` : `${site.distanceKm.toFixed(1)}km`}` : ""}`}
                  >
                    <Landmark className="size-3 text-white" />
                  </button>
                </MarkerContent>
                <MarkerLabel>{site.siteName}</MarkerLabel>
              </MapMarker>
            ))}

          <MapControls showZoom showLocate showCompass />
        </Map>

        {/* Mobile filter bar toggle */}
        <div className="absolute left-3 top-3 z-10 hidden gap-2 lg:flex">
          <span className="rounded-md bg-card px-3 py-1.5 text-xs font-medium text-heading shadow-sm">
            {filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""}
            {hasLocation && " · sorted by distance"}
          </span>
        </div>
      </div>

      {/* Right Detail Panel (slide-in) */}
      {isDetailOpen && selectedSite && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 bg-black/30 max-lg:block lg:hidden"
            onClick={handleCloseDetail}
          />

          <div
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-xl transition-transform duration-300 ease-in-out",
              "max-lg:max-w-full",
            )}
            role="dialog"
            aria-label={`Details for ${selectedSite.siteName}`}
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-heading">
                <MapPin className="size-4 text-primary" />
                Site Details
              </h2>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close detail panel"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              <div className="flex aspect-video items-center justify-center bg-muted">
                {selectedSite.primaryImage ? (
                  <img
                    src={selectedSite.primaryImage}
                    alt={selectedSite.siteName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Landmark className="size-14 text-muted-foreground/40" />
                )}
              </div>

              {/* Title */}
              <div className="space-y-2 px-5 py-4">
                <h3 className="text-lg font-semibold leading-tight text-heading">
                  {selectedSite.siteName}
                </h3>

                {selectedSite.categoryName && (
                  <span
                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: selectedSite.categoryColor
                        ? `${selectedSite.categoryColor}15`
                        : undefined,
                      borderColor: selectedSite.categoryColor ?? undefined,
                    }}
                  >
                    {selectedSite.categoryName}
                  </span>
                )}

                <p className="text-sm text-muted-foreground">
                  {[selectedSite.barangay, selectedSite.municipalityName]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {selectedSite.shortDescription && (
                  <p className="text-sm leading-relaxed text-body">
                    {selectedSite.shortDescription}
                  </p>
                )}

                {selectedSite.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="size-4 fill-warning text-warning" />
                    <span className="font-medium text-heading">
                      {selectedSite.averageRating.toFixed(1)}
                    </span>
                    <span>({selectedSite.reviewCount} reviews)</span>
                  </div>
                )}

                {selectedSite.distanceKm != null && (
                  <p className="flex items-center gap-1.5 text-sm text-body">
                    <Navigation className="size-3.5 text-primary" />
                    <span>
                      {selectedSite.distanceKm < 1
                        ? `${(selectedSite.distanceKm * 1000).toFixed(0)} meters`
                        : `${selectedSite.distanceKm.toFixed(2)} km`}{" "}
                      from your location
                    </span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 px-5 pb-6">
                <Link
                  href={`/heritage/${selectedSite.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Landmark className="size-4" />
                  View Full Details
                </Link>

                <a
                  href={getDirectionsUrl(
                    selectedSite.latitude,
                    selectedSite.longitude,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-heading transition-colors hover:bg-muted"
                >
                  <ExternalLink className="size-4" />
                  Get Directions
                </a>
              </div>

              {/* Nearby Sites in Detail Panel */}
              {filteredSites.length > 1 && (
                <div className="border-t border-border px-5 py-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Other Sites
                  </h4>
                  <ul className="space-y-2">
                    {filteredSites
                      .filter((s) => s.id !== selectedSite.id)
                      .slice(0, 5)
                      .map((site) => (
                        <li key={site.id}>
                          <button
                            type="button"
                            onClick={() => handleSiteClick(site)}
                            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
                          >
                            <span
                              className="inline-block size-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: site.categoryColor ?? "#6366f1",
                              }}
                            />
                            <span className="min-w-0 flex-1 truncate font-medium text-heading">
                              {site.siteName}
                            </span>
                            {site.distanceKm != null && (
                              <span className="shrink-0 text-muted-foreground">
                                {site.distanceKm < 1
                                  ? `${(site.distanceKm * 1000).toFixed(0)}m`
                                  : `${site.distanceKm.toFixed(1)}km`}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
