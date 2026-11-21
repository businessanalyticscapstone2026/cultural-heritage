"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Map as MapIcon,
  Landmark,
  Layers,
  Search,
  X,
  MapPin,
  Navigation,
  Star,
  Loader2,
  Locate,
  Sparkles,
  Route,
  Plus,
} from "lucide-react"
import type MapLibreGL from "maplibre-gl"
import type { FillLayerSpecification, LineLayerSpecification } from "maplibre-gl"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBoundsFromViewport } from "@/utils/geo"
import { useGisUiStore } from "../stores/gis-ui"
import { useNearbySites } from "../hooks/use-nearby-sites"
import { fetchDrivingDirections } from "../services/directions"
import MapEntryState from "./map-entry-state"
import HeritageStatistics from "./heritage-statistics"
import NearbyDestinationsList from "./nearby-destinations-list"
import CuratedTrailsPanel from "./curated-trails-panel"
import { RoutePlannerPanel } from "@/features/route-optimization/components"
import { trackRecommendationClickAction } from "@/features/recommendation/actions/click-track"
import { DEFAULT_BOUNDARY_STYLE } from "../constants"
import type { TouristMapSite, TouristMapCategory, CuratedTrail } from "../services/tourist-map"
import type { SiteWithDistance } from "../hooks/use-nearby-sites"
import type { DrivingDirections } from "../services/directions"
import type { GeoFeature, GeoFeatureCollection } from "../types"
import type { User } from "@supabase/supabase-js"

type BoundaryFillPaint = NonNullable<FillLayerSpecification["paint"]>
type BoundaryLinePaint = NonNullable<LineLayerSpecification["paint"]>

/** Flattens a Polygon/MultiPolygon coordinate tree into a [minLng,minLat]/[maxLng,maxLat] box. */
function computeBoundsFromGeometry(
  geometry: GeoFeature["geometry"],
): [[number, number], [number, number]] | null {
  const coords: number[][] = []
  function collect(node: unknown): void {
    if (!Array.isArray(node)) return
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      coords.push(node as number[])
      return
    }
    for (const child of node) collect(child)
  }
  collect(geometry.coordinates)
  if (coords.length === 0) return null

  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

const Map = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
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
const MapRoute = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapRoute),
  { ssr: false },
)
const MapGeoJSON = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapGeoJSON),
  { ssr: false },
)

interface TouristGISPanelProps {
  sites: TouristMapSite[]
  categories: TouristMapCategory[]
  curatedTrails: CuratedTrail[]
  municipalities: { id: string; name: string }[]
  boundaries: GeoFeatureCollection
  user: User | null
  homeLatitude: number | null
  homeLongitude: number | null
  userLatitude: number | null
  userLongitude: number | null
  locationSource: "browser" | "profile" | "none"
  /** Deep-link from homepage CTAs (`/map?site=<uuid>`). */
  initialSiteId?: string | null
  /** Deep-link from "Plan My Trip" CTAs (`/map?planRoute=<uuid>`). */
  initialPlanRouteSiteId?: string | null
}

export default function TouristGISPanel({
  sites,
  categories,
  curatedTrails,
  municipalities,
  boundaries,
  user,
  userLatitude,
  userLongitude,
  initialSiteId = null,
  initialPlanRouteSiteId = null,
}: TouristGISPanelProps) {
  const {
    selectedSiteId,
    isDetailOpen,
    categoryFilter,
    searchQuery,
    visibleCategoryIds,
    showRecommended,
    recommendedSiteIds,
    openDetail,
    closeDetail,
    setCategoryFilter,
    setSearchQuery,
    setVisibleCategoryIds,
    dismissEntryState,
    setMapBounds,
    setShowRecommended,
    setRecommendedSiteIds,
    routePlanningMode,
    routeStopIds,
    activeRoute,
    addRouteStop,
    setRoutePlanningMode,
    showRouteOnMap,
  } = useGisUiStore()

  const [selectedSite, setSelectedSite] = useState<SiteWithDistance | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null)
  const [recommendationRecIds, setRecommendationRecIds] = useState<Record<string, string>>({})
  const [directionsSiteId, setDirectionsSiteId] = useState<string | null>(null)
  const [directionsRoute, setDirectionsRoute] = useState<DrivingDirections | null>(null)
  const [directionsLoading, setDirectionsLoading] = useState(false)
  const [directionsFailed, setDirectionsFailed] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<MapLibreGL.Map | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        const ids: string[] = []
        const recIdMap: Record<string, string> = {}
        for (const item of json.data ?? []) {
          ids.push(item.site.id)
          if (item.recommendationId) recIdMap[item.site.id] = item.recommendationId
        }
        setRecommendedSiteIds(ids)
        setRecommendationRecIds(recIdMap)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [setRecommendedSiteIds])

  const nearbySites = useNearbySites(sites, userLatitude, userLongitude)
  const hasLocation = userLatitude != null && userLongitude != null

  const filteredSites = useMemo(
    () =>
      nearbySites.filter((s) => {
        if (selectedMunicipalityId && s.municipalityId !== selectedMunicipalityId) return false
        if (categoryFilter !== "all" && s.categoryId !== categoryFilter) return false
        if (
          visibleCategoryIds.length > 0 &&
          !visibleCategoryIds.includes(s.categoryId ?? "")
        )
          return false
        if (showRecommended && !recommendedSiteIds.includes(s.id)) return false
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
    [
      nearbySites,
      selectedMunicipalityId,
      categoryFilter,
      visibleCategoryIds,
      showRecommended,
      recommendedSiteIds,
      searchQuery,
    ],
  )

  const boundaryFillPaint: BoundaryFillPaint = useMemo(
    () =>
      (selectedMunicipalityId
        ? {
            "fill-color": [
              "case",
              ["==", ["get", "municipalityId"], selectedMunicipalityId],
              DEFAULT_BOUNDARY_STYLE.highlightFillColor,
              DEFAULT_BOUNDARY_STYLE.fillColor,
            ],
            "fill-opacity": [
              "case",
              ["==", ["get", "municipalityId"], selectedMunicipalityId],
              DEFAULT_BOUNDARY_STYLE.highlightFillOpacity,
              DEFAULT_BOUNDARY_STYLE.fillOpacity,
            ],
          }
        : {
            "fill-color": DEFAULT_BOUNDARY_STYLE.fillColor,
            "fill-opacity": DEFAULT_BOUNDARY_STYLE.fillOpacity,
          }) as unknown as BoundaryFillPaint,
    [selectedMunicipalityId],
  )

  const boundaryLinePaint: BoundaryLinePaint = {
    "line-color": DEFAULT_BOUNDARY_STYLE.strokeColor,
    "line-width": DEFAULT_BOUNDARY_STYLE.strokeWidth,
  }

  const handleMunicipalitySelect = useCallback(
    (municipalityId: string | null) => {
      setSelectedMunicipalityId(municipalityId)
      if (!municipalityId || !mapInstanceRef.current) return

      const feature = boundaries.features.find(
        (f) => f.properties.municipalityId === municipalityId,
      )
      if (!feature) return

      const bounds = computeBoundsFromGeometry(feature.geometry)
      if (!bounds) return

      mapInstanceRef.current.fitBounds(bounds, { padding: 80, duration: 800 })
    },
    [boundaries],
  )

  const isRecommendedSite = useCallback(
    (siteId: string) => recommendedSiteIds.includes(siteId),
    [recommendedSiteIds],
  )

  const handleSiteClick = useCallback(
    (site: SiteWithDistance) => {
      if (routePlanningMode) {
        addRouteStop(site.id)
        return
      }
      setSelectedSite(site)
      openDetail(site.id)
    },
    [routePlanningMode, addRouteStop, openDetail],
  )

  // Honor /map?site= deep links (e.g. tourism highlights "View on map" CTA)
  useEffect(() => {
    if (!initialSiteId) return
    const match = nearbySites.find((s) => s.id === initialSiteId)
    if (match) {
      setSelectedSite(match)
      openDetail(match.id)
    }
  }, [initialSiteId, nearbySites, openDetail])

  // Honor /map?planRoute= deep link — start route planning with that site
  useEffect(() => {
    if (!initialPlanRouteSiteId) return
    const match = nearbySites.find((s) => s.id === initialPlanRouteSiteId)
    if (match) {
      setRoutePlanningMode(true)
      addRouteStop(match.id)
      setSelectedSite(match)
      openDetail(match.id)
    }
  }, [initialPlanRouteSiteId, nearbySites, setRoutePlanningMode, addRouteStop, openDetail])

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

  const directionsTarget = directionsSiteId
    ? nearbySites.find((s) => s.id === directionsSiteId) ?? null
    : null

  // Guards against a stale fetch response (from a superseded or cleared
  // request) overwriting the state of a newer one.
  const directionsRequestRef = useRef(0)

  const handleGetDirections = useCallback(
    (site: SiteWithDistance) => {
      if (userLatitude == null || userLongitude == null) return

      const requestId = ++directionsRequestRef.current
      setDirectionsSiteId(site.id)
      setDirectionsRoute(null)
      setDirectionsFailed(false)
      setDirectionsLoading(true)
      handleCloseDetail()

      // Road-following route (OSRM, OpenStreetMap-based) from the user to the
      // site. Falls back to a straight line (see render below) if it fails.
      fetchDrivingDirections(
        [userLongitude, userLatitude],
        [site.longitude, site.latitude],
      ).then((route) => {
        if (directionsRequestRef.current !== requestId) return
        setDirectionsLoading(false)
        setDirectionsRoute(route)
        setDirectionsFailed(route === null)
      })
    },
    [userLatitude, userLongitude, handleCloseDetail],
  )

  const handleClearDirections = useCallback(() => {
    directionsRequestRef.current += 1
    setDirectionsSiteId(null)
    setDirectionsRoute(null)
    setDirectionsLoading(false)
    setDirectionsFailed(false)
  }, [])

  // Fit the resolved route (or the two endpoints, if the road route failed)
  // on screen. The map only reads center/zoom once at mount, so recentering
  // afterward has to go through the map instance directly.
  useEffect(() => {
    if (!directionsTarget || !mapInstanceRef.current) return
    if (userLatitude == null || userLongitude == null) return
    if (!directionsRoute && !directionsFailed) return // wait for the fetch to resolve

    const points: [number, number][] = directionsRoute
      ? directionsRoute.coordinates
      : [
          [userLongitude, userLatitude],
          [directionsTarget.longitude, directionsTarget.latitude],
        ]
    const lngs = points.map((p) => p[0])
    const lats = points.map((p) => p[1])

    mapInstanceRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 80, duration: 800, maxZoom: 16 },
    )
  }, [directionsTarget, directionsRoute, directionsFailed, userLatitude, userLongitude])

  const handleViewportChange = useCallback(
    (vp: { center: [number, number]; zoom: number }) => {
      const bounds = getBoundsFromViewport(vp.center[0], vp.center[1], vp.zoom)
      setMapBounds(bounds)
    },
    [setMapBounds],
  )

  const handleExplore = useCallback(() => {
    dismissEntryState()
  }, [dismissEntryState])

  const handleCenterOnLocation = useCallback(() => {
    if (!hasUserMarker || mapRef.current == null) return
    dismissEntryState()
  }, [hasUserMarker, dismissEntryState])

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex w-80 shrink-0 flex-col border-r border-ink/10 bg-cream transition-all duration-300",
          "max-lg:fixed max-lg:inset-y-16 max-lg:left-0 max-lg:z-30 max-lg:w-full max-lg:max-w-sm max-lg:shadow-xl",
          "max-md:-translate-x-full max-md:data-open:translate-x-0",
        )}
        data-open={showFilters ? "true" : undefined}
        aria-label="Map sidebar with site list and filters"
      >
        {/* Sidebar Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MapIcon className="size-4 text-accent" />
            Heritage Map
          </h2>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="rounded-lg p-1 text-ink-soft hover:bg-parchment hover:text-ink lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable sidebar body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {/* Search */}
        <div className="border-b border-ink/10 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-cream py-1.5 pl-8 pr-3 text-xs focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50"
              aria-label="Search heritage sites"
            />
          </div>
        </div>

        {/* Municipality tabs */}
        {municipalities.length > 0 && (
          <div className="border-b border-ink/10 p-3">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Municipality
            </label>
            <div
              className="flex gap-1.5 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Filter by municipality"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedMunicipalityId === null}
                onClick={() => handleMunicipalitySelect(null)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedMunicipalityId === null
                    ? "bg-ink text-cream"
                    : "bg-parchment text-ink-soft hover:bg-parchment/80",
                )}
              >
                All
              </button>
              {municipalities.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedMunicipalityId === m.id}
                  onClick={() => handleMunicipalitySelect(m.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedMunicipalityId === m.id
                      ? "bg-ink text-cream"
                      : "bg-parchment text-ink-soft hover:bg-parchment/80",
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Heritage Statistics — counts update on pan/zoom via mapBounds */}
        <HeritageStatistics sites={sites} categories={categories} />

        {/* Nearby Destinations — top 5 by distance from user location */}
        <NearbyDestinationsList
          sites={nearbySites}
          onSiteClick={handleSiteClick}
          selectedSiteId={selectedSiteId}
        />

        {/* Curated Heritage Trails — renders trail cards when is_curated routes exist */}
        <CuratedTrailsPanel trails={curatedTrails} />
        {/*
          CR-CHTS-005: Recommendation integration point.
          Insert <RecommendationPanel> here. Receives:
          - user (User | null) from props
          - sites (TouristMapSite[]) for context
          - current viewport bounds from store for scoping

        */}

        <RoutePlannerPanel sites={nearbySites} user={user} />

        {/* User location indicator */}
        <div className="border-b border-ink/10">
          {hasLocation && (
            <div className="bg-accent/5 px-4 py-2">
              <p className="flex items-center gap-1.5 text-[11px] text-accent">
                <Locate className="size-3" />
                Showing distances from your location
              </p>
            </div>
          )}
          {!hasLocation && (
            <div className="bg-warning/5 px-4 py-2">
              <p className="text-[11px] text-warning">
                Enable location access or set a home location to see distances.
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="border-b border-ink/10 p-3">
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              <Sparkles className="mr-1 inline size-3 text-accent" />
              Recommended
            </label>
            <button
              type="button"
              onClick={() => setShowRecommended(!showRecommended)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                showRecommended
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-ink-soft hover:bg-parchment"
              }`}
            >
              <span className={`inline-block size-3 rounded border ${
                showRecommended ? "bg-accent border-accent" : "border-ink/30 bg-cream"
              }`}>
                {showRecommended && (
                  <svg className="size-full text-white" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                )}
              </span>
              Show recommended sites
              {recommendedSiteIds.length > 0 && (
                <span className="ml-auto font-mono text-[10px] text-accent/70">
                  {recommendedSiteIds.length}
                </span>
              )}
            </button>
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-cream px-2.5 py-1.5 text-xs focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50"
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
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
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
                className="text-[10px] text-ink-soft underline underline-offset-2 hover:text-ink"
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
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-parchment"
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
                    className="size-3.5 accent-ink"
                  />
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color ?? "#6366f1" }}
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-ink-soft">{cat.siteCount}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Full Site List */}
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Heritage Sites
            </span>
            <Badge variant="secondary" className="text-[10px] bg-parchment text-ink-soft">
              {filteredSites.length}
            </Badge>
          </div>

          {filteredSites.length === 0 ? (
            <p className="py-8 text-center text-xs text-ink-soft">
              No sites match the current filters.
            </p>
          ) : (
            <ul className="space-y-1" role="listbox" aria-label="Heritage sites list">
              {filteredSites.map((site) => {
                const inRoute = routeStopIds.includes(site.id)
                return (
                <li key={site.id} role="option" aria-selected={selectedSiteId === site.id}>
                  <button
                    type="button"
                    onClick={() => handleSiteClick(site)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-parchment",
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
        </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setShowFilters(true)}
        className={cn(
          "fixed bottom-4 left-4 z-20 rounded-full bg-ink p-3 text-cream shadow-lg transition-all hover:bg-ink/90 lg:hidden",
          showFilters && "hidden",
        )}
        aria-label="Open filters and site list"
      >
        <MapIcon className="size-5" />
      </button>

      {/* Main Map Area */}
      <div ref={mapRef} className="relative flex-1">
        {/* Map Entry State — summary overlay shown on first load */}
        <MapEntryState
          sites={nearbySites}
          categories={categories}
          hasUserLocation={hasUserMarker}
          onCenterOnLocation={handleCenterOnLocation}
          onExplore={handleExplore}
        />

        <Map
          ref={mapInstanceRef}
          className="h-full w-full"
          center={mapCenter}
          zoom={hasUserMarker ? 11 : 10}
          onViewportChange={handleViewportChange}
          theme="light"
        >
          {/* Municipal boundary overlay */}
          {boundaries.features.length > 0 && (
            <MapGeoJSON
              id="municipal-boundaries"
              data={boundaries as never}
              promoteId="municipalityId"
              fillPaint={boundaryFillPaint}
              linePaint={boundaryLinePaint}
            />
          )}

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
            .map((site) => {
              const recommended = isRecommendedSite(site.id)
              return (
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
                      "flex size-7 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                      selectedSiteId === site.id && "scale-125 ring-2 ring-accent",
                      recommended && "ring-2 ring-accent/40",
                    )}
                    style={{
                      backgroundColor: site.categoryColor ?? "#6366f1",
                    }}
                    title={site.siteName}
                    aria-label={`${site.siteName}${site.distanceKm != null ? `, ${site.distanceKm < 1 ? `${(site.distanceKm * 1000).toFixed(0)}m` : `${site.distanceKm.toFixed(1)}km`}` : ""}`}
                  >
                    {recommended ? (
                      <Sparkles className="size-3.5 text-white" />
                    ) : (
                      <Landmark className="size-3 text-white" />
                    )}
                  </button>
                </MarkerContent>
                <MarkerLabel>
                  {site.siteName}
                  {recommended && " ★"}
                </MarkerLabel>
              </MapMarker>
            )})}

          {/* Route visualization overlay */}
          {showRouteOnMap && activeRoute && activeRoute.path.length >= 2 && (
            <MapRoute
              id="active-route-path"
              coordinates={activeRoute.path}
              color="#2E5BFF"
              width={5}
              opacity={0.8}
            />
          )}
          {showRouteOnMap && activeRoute && activeRoute.stops.map((stop, index) => (
            <MapMarker
              key={`route-stop-${stop.siteId}`}
              longitude={stop.longitude}
              latitude={stop.latitude}
            >
              <MarkerContent>
                <div className="relative">
                  <MapPin
                    className="size-6 -translate-x-1/2 -translate-y-full drop-shadow-lg"
                    style={{
                      fill: ["#2E5BFF","#34A853","#F4B400","#EA4335","#9C27B0","#00BCD4","#FF5722","#607D8B"][index % 8],
                      color: "#ffffff",
                    }}
                  />
                  <span className="absolute left-1/2 top-0 flex size-4 -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full bg-white text-[8px] font-bold shadow-sm"
                    style={{ color: ["#2E5BFF","#34A853","#F4B400","#EA4335","#9C27B0","#00BCD4","#FF5722","#607D8B"][index % 8] }}
                    aria-hidden="true"
                  >
                    {stop.stopOrder}
                  </span>
                </div>
              </MarkerContent>
              <MarkerLabel>{stop.siteName}</MarkerLabel>
            </MapMarker>
          ))}

          {/* "Get Directions" overlay — road-following route (OSRM) from the
              user to a single site, falling back to a dashed straight line
              while loading or if the routing request fails */}
          {directionsTarget && hasUserMarker && (
            <>
              {directionsRoute ? (
                <MapRoute
                  id="quick-directions"
                  coordinates={directionsRoute.coordinates}
                  color="#4285F4"
                  width={5}
                  opacity={0.85}
                  interactive={false}
                />
              ) : (
                <MapRoute
                  id="quick-directions"
                  coordinates={[
                    [userLongitude, userLatitude],
                    [directionsTarget.longitude, directionsTarget.latitude],
                  ]}
                  color="#EA4335"
                  width={4}
                  opacity={0.75}
                  dashArray={[2, 2]}
                  interactive={false}
                />
              )}
              <MapMarker
                longitude={directionsTarget.longitude}
                latitude={directionsTarget.latitude}
              >
                <MarkerContent>
                  <div className="relative">
                    <MapPin
                      className="size-7 -translate-x-1/2 -translate-y-full drop-shadow-lg"
                      style={{ fill: "#EA4335", color: "#ffffff" }}
                    />
                  </div>
                </MarkerContent>
                <MarkerLabel>{directionsTarget.siteName}</MarkerLabel>
              </MapMarker>
            </>
          )}

          <MapControls showZoom showLocate showCompass />
        </Map>

        {/* Site count badge */}
        <div className="absolute left-3 top-3 z-10 hidden gap-2 lg:flex">
          <span className="rounded-lg bg-cream px-3 py-1.5 text-xs font-medium text-ink shadow-sm">
            {filteredSites.length} site{filteredSites.length !== 1 ? "s" : ""}
            {hasLocation && " · sorted by distance"}
          </span>
        </div>

        {/* Quick directions banner */}
        {directionsTarget && hasUserMarker && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-cream px-3 py-1.5 text-xs font-medium text-ink shadow-sm lg:left-auto lg:right-3">
            {directionsLoading ? (
              <Loader2 className="size-3.5 animate-spin text-[#4285F4]" />
            ) : (
              <Navigation className={cn("size-3.5", directionsRoute ? "text-[#4285F4]" : "text-[#EA4335]")} />
            )}
            <span>
              {directionsLoading ? (
                `Finding route to ${directionsTarget.siteName}…`
              ) : directionsRoute ? (
                `${directionsTarget.siteName} · ${directionsRoute.distanceKm.toFixed(1)} km · ~${directionsRoute.durationMin} min`
              ) : (
                <>
                  Directions to {directionsTarget.siteName}
                  {directionsTarget.distanceKm != null &&
                    ` · ${directionsTarget.distanceKm < 1 ? `${(directionsTarget.distanceKm * 1000).toFixed(0)}m` : `${directionsTarget.distanceKm.toFixed(1)}km`} (straight-line, road route unavailable)`}
                </>
              )}
            </span>
            <button
              type="button"
              onClick={handleClearDirections}
              className="rounded p-0.5 text-ink-soft hover:text-ink"
              aria-label="Clear directions"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
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
              "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-ink/10 bg-cream shadow-xl transition-transform duration-300 ease-in-out",
              "max-lg:max-w-full",
            )}
            role="dialog"
            aria-label={`Details for ${selectedSite.siteName}`}
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
              <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                <MapPin className="size-4 text-accent" />
                Site Details
              </h2>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-parchment hover:text-ink"
                aria-label="Close detail panel"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Image */}
              <div className="flex aspect-video items-center justify-center bg-parchment">
                {selectedSite.primaryImage ? (
                  <img
                    src={selectedSite.primaryImage}
                    alt={selectedSite.siteName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Landmark className="size-14 text-ink-soft/40" />
                )}
              </div>

              {/* Title */}
              <div className="space-y-2 px-5 py-4">
              <h3 className="text-lg font-semibold leading-tight text-ink">
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

                <p className="text-sm text-ink-soft">
                  {[selectedSite.barangay, selectedSite.municipalityName]
                    .filter(Boolean)
                    .join(", ")}
                </p>

                {selectedSite.shortDescription && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {selectedSite.shortDescription}
                  </p>
                )}

                {selectedSite.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-ink-soft">
                    <Star className="size-4 fill-warning text-warning" />
                    <span className="font-medium text-ink">
                      {selectedSite.averageRating.toFixed(1)}
                    </span>
                    <span>({selectedSite.reviewCount} reviews)</span>
                  </div>
                )}

                {selectedSite.distanceKm != null && (
                  <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                    <Navigation className="size-3.5 text-accent" />
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
                  onClick={() => {
                    const recId = recommendationRecIds[selectedSite.id]
                    if (recId) trackRecommendationClickAction(recId)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-opacity hover:opacity-90"
                >
                  <Landmark className="size-4" />
                  View Full Details
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    addRouteStop(selectedSite.id)
                    setRoutePlanningMode(true)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  <Route className="size-4" />
                  {routeStopIds.includes(selectedSite.id) ? "Added to Trip" : "Add to Trip"}
                </button>

                <button
                  type="button"
                  onClick={() => handleGetDirections(selectedSite)}
                  disabled={!hasUserMarker}
                  title={hasUserMarker ? undefined : "Enable location to get directions"}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-cream px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-parchment disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Navigation className="size-4" />
                  Get Directions
                </button>
              </div>

              {/* Nearby Sites in Detail Panel */}
              {filteredSites.length > 1 && (
                <div className="border-t border-ink/10 px-5 py-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
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
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-parchment"
                          >
                            <span
                              className="inline-block size-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: site.categoryColor ?? "#6366f1",
                              }}
                            />
                            <span className="min-w-0 flex-1 truncate font-medium text-ink">
                              {site.siteName}
                            </span>
                            {site.distanceKm != null && (
                              <span className="shrink-0 text-ink-soft">
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
