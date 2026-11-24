"use client"

import { Fragment, useState, useCallback, useMemo, useEffect, useRef } from "react"
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
  Check,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  SlidersHorizontal,
  MapPinOff,
} from "lucide-react"
import type MapLibreGL from "maplibre-gl"
import type { FillLayerSpecification, LineLayerSpecification } from "maplibre-gl"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBoundsFromViewport } from "@/utils/geo"
import { useGisUiStore } from "../stores/gis-ui"
import { useNearbySites } from "../hooks/use-nearby-sites"
import { fetchDrivingAlternatives } from "../services/directions"
import { SPIDERFY_MAX_SITES, coordinateKey, groupByCoordinate, hasCoordinates, spiderfyOffsets } from "../services/coordinate-groups"
import MapEntryState from "./map-entry-state"
import HeritageStatistics from "./heritage-statistics"
import NearbyDestinationsList from "./nearby-destinations-list"
import CuratedTrailsPanel from "./curated-trails-panel"
import { RoutePlannerPanel } from "@/features/route-optimization/components"
import { useRoutePlanner } from "@/features/route-optimization/hooks"
import { ROUTE_OPTION_META } from "@/features/route-optimization/constants"
import { trackRecommendationClickAction } from "@/features/recommendation/actions/click-track"
import { DEFAULT_BOUNDARY_STYLE } from "../constants"
import type { TouristMapSite, TouristMapCategory, CuratedTrail } from "../services/tourist-map"
import type { SiteWithDistance } from "../hooks/use-nearby-sites"
import type { DrivingDirections } from "../services/directions"
import type { GeoFeature, GeoFeatureCollection } from "../types"
import type { User } from "@supabase/supabase-js"
import type { InventoryCoverage } from "@/features/municipalities/services/inventory-coverage"

/** Directions line colors: fastest road always green, another selected road blue, other roads gray. */
const DIRECTIONS_COLORS = { fastest: "#16A34A", selected: "#2563EB", other: "#6B7280" }

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
  inventoryCoverage: InventoryCoverage | null
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
  inventoryCoverage,
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
    compareAllRoutes,
    addRouteStop,
    removeRouteStop,
    setRoutePlanningMode,
    showRouteOnMap,
  } = useGisUiStore()

  const [selectedSite, setSelectedSite] = useState<SiteWithDistance | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [showCategoriesAccordion, setShowCategoriesAccordion] = useState(false)
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState<string | null>(null)
  const [recommendationRecIds, setRecommendationRecIds] = useState<Record<string, string>>({})
  const [directionsSiteId, setDirectionsSiteId] = useState<string | null>(null)
  // All roads found, fastest first; the selected one is shown in detail.
  const [directionsRoutes, setDirectionsRoutes] = useState<DrivingDirections[] | null>(null)
  const [selectedDirectionsIndex, setSelectedDirectionsIndex] = useState(0)
  const directionsRoute = directionsRoutes?.[selectedDirectionsIndex] ?? null
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
  const routePlanner = useRoutePlanner(userLatitude, userLongitude)
  const selectedRouteOption = showRouteOnMap ? routePlanner.selectedOption : null
  const otherRouteOptions =
    showRouteOnMap && compareAllRoutes && routePlanner.result
      ? routePlanner.result.options.filter((o) => o !== selectedRouteOption)
      : []
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

  const pinnedSites = useMemo(() => nearbySites.filter(hasCoordinates), [nearbySites])
  const pinnedCount = filteredSites.filter(hasCoordinates).length
  const unpinnedCount = filteredSites.length - pinnedCount
  const markerGroups = useMemo(() => groupByCoordinate(filteredSites), [filteredSites])
  // Stack currently fanned out on the map (exact-coordinate group key).
  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null)
  // How many published sites share each exact coordinate (all sites, not just filtered).
  const coordinateShareCounts = useMemo(() => {
    const counts = new globalThis.Map<string, number>()
    for (const group of groupByCoordinate(sites)) counts.set(group.key, group.sites.length)
    return counts
  }, [sites])

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
      const pinned = hasCoordinates(site)
      // Sites without a pin cannot be routed; open their details instead.
      if (routePlanningMode && pinned) {
        addRouteStop(site.id)
        return
      }
      setExpandedGroupKey(pinned ? coordinateKey(site.latitude, site.longitude) : null)
      setSelectedSite(site)
      openDetail(site.id)
      setShowFilters(false)
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

  const isSiteInTrip = selectedSite ? routeStopIds.includes(selectedSite.id) : false
  const selectedSitePinned = selectedSite != null && hasCoordinates(selectedSite)
  const selectedSiteSharedCount =
    selectedSite && hasCoordinates(selectedSite)
      ? coordinateShareCounts.get(coordinateKey(selectedSite.latitude, selectedSite.longitude)) ?? 1
      : 0

  const handleToggleTrip = useCallback(() => {
    if (!selectedSite) return
    if (isSiteInTrip) {
      removeRouteStop(selectedSite.id)
    } else {
      setRoutePlanningMode(true)
      addRouteStop(selectedSite.id)
      setDesktopSidebarOpen(true)
    }
  }, [selectedSite, isSiteInTrip, removeRouteStop, addRouteStop, setRoutePlanningMode])

  useEffect(() => {
    if (!isDetailOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseDetail()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDetailOpen, handleCloseDetail])

  const firstPinned = markerGroups[0]
  const mapCenter: [number, number] =
    userLatitude != null && userLongitude != null
      ? [userLongitude, userLatitude]
      : firstPinned
        ? [firstPinned.longitude, firstPinned.latitude]
        : [120.78, 13.92]

  const hasUserMarker = userLatitude != null && userLongitude != null

  const directionsTarget = directionsSiteId
    ? pinnedSites.find((s) => s.id === directionsSiteId) ?? null
    : null

  // Guards against a stale fetch response (from a superseded or cleared
  // request) overwriting the state of a newer one.
  const directionsRequestRef = useRef(0)

  const handleGetDirections = useCallback(
    (site: SiteWithDistance) => {
      if (userLatitude == null || userLongitude == null) return
      if (!hasCoordinates(site)) return

      const requestId = ++directionsRequestRef.current
      setDirectionsSiteId(site.id)
      setDirectionsRoutes(null)
      setSelectedDirectionsIndex(0)
      setDirectionsFailed(false)
      setDirectionsLoading(true)
      handleCloseDetail()

      // Road-following route (OSRM, OpenStreetMap-based) from the user to the
      // site. Falls back to a straight line (see render below) if it fails.
      fetchDrivingAlternatives(
        [userLongitude, userLatitude],
        [site.longitude, site.latitude],
      ).then((routes) => {
        if (directionsRequestRef.current !== requestId) return
        setDirectionsLoading(false)
        setDirectionsRoutes(routes)
        setDirectionsFailed(routes === null)
      })
    },
    [userLatitude, userLongitude, handleCloseDetail],
  )

  const handleClearDirections = useCallback(() => {
    directionsRequestRef.current += 1
    setDirectionsSiteId(null)
    setDirectionsRoutes(null)
    setSelectedDirectionsIndex(0)
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

  // Fit the map to the selected route option whenever the selection changes
  useEffect(() => {
    if (!selectedRouteOption || !mapInstanceRef.current) return
    if (selectedRouteOption.path.length < 2) return

    const lngs = selectedRouteOption.path.map((p) => p[0])
    const lats = selectedRouteOption.path.map((p) => p[1])

    mapInstanceRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 80, duration: 800, maxZoom: 16 },
    )
  }, [selectedRouteOption])

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

  const siteCountSummary =
    unpinnedCount > 0
      ? `${pinnedCount} on map · ${unpinnedCount} not yet pinned`
      : `${pinnedCount} on map`

  const renderSiteMarkerButton = (site: SiteWithDistance) => {
    const recommended = isRecommendedSite(site.id)
    return (
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
        title={`${site.siteName}${recommended ? " ★" : ""}`}
        aria-label={`${site.siteName}${site.distanceKm != null ? `, ${site.distanceKm < 1 ? `${(site.distanceKm * 1000).toFixed(0)}m` : `${site.distanceKm.toFixed(1)}km`}` : ""}`}
      >
        {recommended ? (
          <Sparkles className="size-3.5 text-white" />
        ) : (
          <Landmark className="size-3 text-white" />
        )}
      </button>
    )
  }

  return (
    <div className="relative flex h-full gap-0 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full max-h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden border-r border-ink/10 bg-cream transition-all duration-300 lg:w-96",
          "max-lg:fixed max-lg:left-0 max-lg:bottom-16 max-lg:top-14 max-lg:z-40 max-lg:w-[88vw] max-lg:max-w-[340px] max-lg:rounded-r-2xl max-lg:shadow-2xl",
          "max-lg:-translate-x-full max-lg:data-open:translate-x-0",
          !desktopSidebarOpen && "lg:-ml-96",
        )}
        data-open={showFilters ? "true" : undefined}
        aria-label="Map sidebar with site list and filters"
      >
        {/* Sidebar Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-3 bg-cream">
          <div className="flex items-center gap-2">
            <MapIcon className="size-4 text-accent" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink">Heritage Map</h2>
                <Badge variant="secondary" className="bg-parchment text-[10px] text-ink-soft">
                  {filteredSites.length}
                </Badge>
              </div>
              <p className="text-[10px] text-ink-soft">{siteCountSummary}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen(false)}
              className="hidden rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-parchment hover:text-ink lg:flex"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="flex rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-parchment hover:text-ink lg:hidden"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-5" />
            </button>
          </div>
        </div>

        {/* Pinned Search */}
        <div className="shrink-0 border-b border-ink/10 p-3 bg-cream">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-cream py-1.5 pl-8 pr-7 text-xs focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50"
              aria-label="Search heritage sites"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-soft hover:bg-parchment hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Municipality tabs */}
        {municipalities.length > 0 && (
          <div className="shrink-0 border-b border-ink/10 p-3 bg-cream">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Municipality
            </label>
            <div
              className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

        {/* Scrollable sidebar body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-ink/10 scrollbar-thin scrollbar-thumb-ink/20 scrollbar-track-transparent">
          {/* Curated Heritage Trails — renders trail cards when is_curated routes exist */}
          <CuratedTrailsPanel trails={curatedTrails} />

          {/* Route Planner */}
          <RoutePlannerPanel sites={pinnedSites} user={user} planner={routePlanner} />

          {/* Consolidated Filters & Categories Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowCategoriesAccordion((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-parchment"
              aria-expanded={showCategoriesAccordion}
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-ink">
                <SlidersHorizontal className="size-3.5 text-accent" />
                <span>Filters & Categories</span>
                {showRecommended && (
                  <Badge variant="secondary" className="bg-accent/10 text-[9px] text-accent">
                    Recommended
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="bg-parchment text-[9px] text-ink-soft">
                    {categories.find((c) => c.id === categoryFilter)?.name ?? "1 Filter"}
                  </Badge>
                )}
              </span>
              <div className="flex items-center gap-1.5 text-ink-soft">
                {showCategoriesAccordion ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </div>
            </button>

            {showCategoriesAccordion && (
              <div className="space-y-3 bg-parchment/30 p-3.5">
                {/* Recommended */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                    <Sparkles className="mr-1 inline size-3 text-accent" />
                    Personalized
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecommended(!showRecommended)}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                      showRecommended
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-ink-soft hover:bg-parchment bg-cream"
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

                {/* Category select */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                    Primary Category
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

                {/* Legend & Multi-layer toggles */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                      <Layers className="mr-1 inline size-3" />
                      Map Layers
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
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-cream/80 px-2 py-1 text-xs transition-colors hover:bg-parchment"
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
                        <span className="flex-1 truncate">{cat.name}</span>
                        <span className="text-ink-soft">{cat.siteCount}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Heritage Statistics — counts update on pan/zoom via mapBounds */}
          <HeritageStatistics sites={sites} categories={categories} inventoryCoverage={inventoryCoverage} />

          {/* Nearby Destinations */}
          <NearbyDestinationsList
            sites={filteredSites}
            onSiteClick={handleSiteClick}
            selectedSiteId={selectedSiteId}
            routePlanningMode={routePlanningMode}
            routeStopIds={routeStopIds}
          />

          {/* User location indicator */}
          <div>
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
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {showFilters && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setShowFilters(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Map Area */}
      <div ref={mapRef} className="relative flex-1">
        {/* Floating Sidebar Toggle (Mobile & Desktop) */}
        {((!desktopSidebarOpen) || (!showFilters)) && (
          <button
            type="button"
            onClick={() => {
              setDesktopSidebarOpen(true)
              setShowFilters(true)
            }}
            className={cn(
              "absolute left-3 top-3 z-20 flex items-center gap-2 rounded-xl border border-ink/10 bg-cream/95 px-3 py-2 text-xs font-semibold text-ink shadow-md backdrop-blur transition-all active:scale-95 hover:bg-parchment",
              desktopSidebarOpen && "lg:hidden",
              showFilters && "max-lg:hidden",
            )}
            aria-label="Open Heritage Map panel"
          >
            <PanelLeftOpen className="size-4 text-accent" />
            <span>Heritage Map</span>
            <Badge variant="secondary" className="bg-parchment text-[10px] text-ink-soft">
              {filteredSites.length}
            </Badge>
            <span className="font-normal text-ink-soft">{siteCountSummary}</span>
          </button>
        )}
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

          {/* Site markers: one marker per exact coordinate. A stack of N sites shows
              an "N" badge. On click, small stacks fan out into pins next to the point;
              large stacks open a list popup on the point so nothing moves off it. */}
          {markerGroups.map((group) => {
            if (group.sites.length === 1) {
              const site = group.sites[0]
              return (
                <MapMarker
                  key={site.id}
                  longitude={site.longitude}
                  latitude={site.latitude}
                  onClick={() => handleSiteClick(site)}
                >
                  <MarkerContent>{renderSiteMarkerButton(site)}</MarkerContent>
                  <MarkerLabel>
                    {site.siteName}
                    {isRecommendedSite(site.id) && " ★"}
                  </MarkerLabel>
                </MapMarker>
              )
            }

            const expanded = expandedGroupKey === group.key
            const listInPopup = group.sites.length > SPIDERFY_MAX_SITES
            const offsets = expanded && !listInPopup ? spiderfyOffsets(group.sites.length) : []
            return (
              <Fragment key={group.key}>
                <MapMarker
                  longitude={group.longitude}
                  latitude={group.latitude}
                  onClick={() => setExpandedGroupKey(expanded ? null : group.key)}
                >
                  <MarkerContent>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={`${group.sites.length} heritage sites at this location. ${expanded ? "Collapse" : "Show each site"}`}
                      title={`${group.sites.length} sites at this location`}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border-2 border-white bg-ink text-xs font-bold text-cream shadow-lg transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
                        expanded && "ring-2 ring-accent",
                      )}
                    >
                      {expanded ? <X className="size-4" /> : group.sites.length}
                    </button>
                  </MarkerContent>
                  {!expanded && <MarkerLabel>{`${group.sites.length} sites here`}</MarkerLabel>}
                </MapMarker>
                {expanded && listInPopup && (
                  <MapPopup
                    longitude={group.longitude}
                    latitude={group.latitude}
                    onClose={() => setExpandedGroupKey(null)}
                    closeButton
                    offset={22}
                    maxWidth="300px"
                    className="p-0"
                  >
                    <div className="w-64">
                      <p className="border-b border-ink/10 px-3 py-2 text-xs font-semibold text-ink">
                        {group.sites.length} sites at this location
                        <span className="block text-[10px] font-normal text-ink-soft">
                          {[...new Set(group.sites.map((s) => s.municipalityName).filter(Boolean))].join(", ")}
                          {" · exact positions not recorded yet"}
                        </span>
                      </p>
                      <ul className="max-h-64 overflow-y-auto py-1" aria-label="Sites at this location">
                        {group.sites.map((site) => (
                          <li key={site.id}>
                            <button
                              type="button"
                              onClick={() => handleSiteClick(site)}
                              className={cn(
                                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-parchment focus-visible:bg-parchment focus-visible:outline-none",
                                selectedSiteId === site.id && "bg-accent/10 font-medium",
                              )}
                            >
                              <span
                                className="inline-block size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: site.categoryColor ?? "#6366f1" }}
                              />
                              <span className="min-w-0 flex-1 truncate text-ink">{site.siteName}</span>
                              {isRecommendedSite(site.id) && <Sparkles className="size-3 shrink-0 text-accent" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </MapPopup>
                )}
                {expanded &&
                  !listInPopup &&
                  group.sites.map((site, index) => (
                    <MapMarker
                      key={`${site.id}-spider`}
                      longitude={site.longitude}
                      latitude={site.latitude}
                      offset={offsets[index]}
                      onClick={() => handleSiteClick(site)}
                    >
                      <MarkerContent>{renderSiteMarkerButton(site)}</MarkerContent>
                    </MapMarker>
                  ))}
              </Fragment>
            )
          })}

          {/* Route options overlay: other options thin and dashed (compare mode),
              the selected option thick and drawn last so it sits on top.
              Keys include the kind so a newly selected line is re-added above the rest. */}
          {otherRouteOptions.map((option) => (
            <MapRoute
              key={`route-option-${option.kind}`}
              id={`route-option-${option.kind}`}
              coordinates={option.path}
              color={ROUTE_OPTION_META[option.kind].color}
              width={3}
              opacity={0.6}
              dashArray={[2, 2]}
              interactive={false}
            />
          ))}
          {selectedRouteOption && selectedRouteOption.path.length >= 2 && (
            <MapRoute
              key={`route-selected-${selectedRouteOption.kind}`}
              id={`route-selected-${selectedRouteOption.kind}`}
              coordinates={selectedRouteOption.path}
              color={ROUTE_OPTION_META[selectedRouteOption.kind].color}
              width={5}
              opacity={0.9}
              // Estimated (straight-line) routes are dashed so color is not the only signal.
              dashArray={selectedRouteOption.estimated ? [1.5, 1.5] : undefined}
              interactive={false}
            />
          )}
          {selectedRouteOption?.stops.map((stop) => (
            <MapMarker
              key={`route-stop-${stop.siteId}`}
              longitude={stop.longitude}
              latitude={stop.latitude}
            >
              <MarkerContent>
                <div className="relative">
                  <MapPin
                    className={cn(
                      "size-6 -translate-x-1/2 -translate-y-full text-white drop-shadow-lg",
                      ROUTE_OPTION_META[selectedRouteOption.kind].fillClass,
                    )}
                  />
                  <span
                    className="absolute left-1/2 top-0 flex size-4 -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full bg-white text-[8px] font-bold text-ink shadow-sm"
                    aria-hidden="true"
                  >
                    {stop.stopOrder}
                  </span>
                </div>
              </MarkerContent>
              <MarkerLabel>{`${stop.stopOrder}. ${stop.siteName}`}</MarkerLabel>
            </MapMarker>
          ))}

          {/* "Get Directions" overlay — road-following route (OSRM) from the
              user to a single site, falling back to a dashed straight line
              while loading or if the routing request fails */}
          {directionsTarget && hasUserMarker && (
            <>
              {directionsRoutes && directionsRoute ? (
                <>
                  {/* Other roads, thinner (the fastest stays green, the rest gray); click one to select it */}
                  {directionsRoutes.map((route, index) =>
                    index === selectedDirectionsIndex ? null : (
                      <MapRoute
                        key={`quick-directions-alt-${index}`}
                        id={`quick-directions-alt-${index}`}
                        coordinates={route.coordinates}
                        color={index === 0 ? DIRECTIONS_COLORS.fastest : DIRECTIONS_COLORS.other}
                        width={4}
                        opacity={0.7}
                        onClick={() => setSelectedDirectionsIndex(index)}
                      />
                    ),
                  )}
                  {/* Selected road on top: green when it is the fastest, blue otherwise.
                      Keyed by index so it is re-added above the gray lines. */}
                  <MapRoute
                    key={`quick-directions-${selectedDirectionsIndex}`}
                    id={`quick-directions-${selectedDirectionsIndex}`}
                    coordinates={directionsRoute.coordinates}
                    color={selectedDirectionsIndex === 0 ? DIRECTIONS_COLORS.fastest : DIRECTIONS_COLORS.selected}
                    width={6}
                    opacity={0.9}
                    interactive={false}
                  />
                </>
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

        {/* Site count badge (only when sidebar is collapsed) */}
        {!desktopSidebarOpen && (
          <div className="absolute left-3 top-14 z-10 hidden gap-2 lg:flex">
            <span className="rounded-lg bg-cream/95 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
              {siteCountSummary}
              {hasLocation && " · sorted by distance"}
            </span>
          </div>
        )}

        {/* Quick directions banner */}
        {directionsTarget && hasUserMarker && (
          <div className="absolute right-3 top-3 z-10 max-w-[calc(100vw-7rem)] space-y-1.5 rounded-lg bg-cream px-3 py-1.5 text-xs font-medium text-ink shadow-sm sm:max-w-none">
            <div className="flex items-center gap-2">
              {directionsLoading ? (
                <Loader2 className="size-3.5 animate-spin text-[#4285F4]" />
              ) : (
                <Navigation className={cn("size-3.5", directionsRoute ? "text-green-600" : "text-[#EA4335]")} />
              )}
              <span>
                {directionsLoading ? (
                  `Finding routes to ${directionsTarget.siteName}…`
                ) : directionsRoute ? (
                  directionsTarget.siteName
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
                className="ml-auto rounded p-0.5 text-ink-soft hover:text-ink"
                aria-label="Clear directions"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {directionsRoutes && (
              <div className="space-y-1" role="group" aria-label="Possible roads">
                {directionsRoutes.map((route, index) => {
                  const fastest = directionsRoutes[0]
                  const isSelected = index === selectedDirectionsIndex
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDirectionsIndex(index)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors focus-visible:ring-3 focus-visible:ring-accent/50",
                        isSelected ? "border-ink/40 bg-card" : "border-transparent hover:bg-card/70",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1 w-4 shrink-0 rounded-full",
                          index === 0 ? "bg-green-600" : isSelected ? "bg-blue-600" : "bg-gray-500",
                        )}
                        aria-hidden="true"
                      />
                      <span className="font-semibold">{index === 0 ? "Fastest" : `Road ${index + 1}`}</span>
                      <span className="text-ink-soft">
                        {route.durationMin} min · {route.distanceKm.toFixed(1)} km
                      </span>
                      {index > 0 && (
                        <span className="ml-auto font-mono text-[10px] text-ink-soft">
                          +{route.durationMin - fastest.durationMin} min
                        </span>
                      )}
                    </button>
                  )
                })}
                {directionsRoutes.length === 1 && (
                  <p className="text-[10px] font-normal text-ink-soft">Only one road found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Detail Panel (slide-in) */}
      {isDetailOpen && selectedSite && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs max-lg:block lg:hidden"
            onClick={handleCloseDetail}
            aria-hidden="true"
          />

          <div
            className={cn(
              "absolute inset-y-0 right-0 z-30 flex h-full w-full max-w-md flex-col border-l border-ink/10 bg-cream shadow-2xl transition-transform duration-300 ease-in-out",
              "max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:bottom-16 max-lg:z-40 max-lg:max-w-full",
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

                {!selectedSitePinned ? (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
                    <MapPinOff className="size-3.5" aria-hidden="true" />
                    No pin yet: this site&apos;s map location has not been recorded.
                  </p>
                ) : (
                  (selectedSite.approximateLocation === "barangay" ||
                    selectedSite.geoAccuracy === "approximate" ||
                    selectedSiteSharedCount > 1) && (
                    <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {selectedSite.approximateLocation === "barangay"
                        ? `Approximate location: pinned at the centre of ${selectedSite.barangay}. The exact spot has not been recorded yet.`
                        : selectedSite.geoAccuracy === "approximate"
                          ? "Approximate location"
                          : `Coordinates may be approximate (shared with ${selectedSiteSharedCount - 1} other site${selectedSiteSharedCount > 2 ? "s" : ""})`}
                    </p>
                  )
                )}

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
                  onClick={handleToggleTrip}
                  disabled={!selectedSitePinned}
                  title={selectedSitePinned ? undefined : "This site has no map pin yet"}
                  className={cn(
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                    isSiteInTrip
                      ? "border border-accent bg-accent text-white hover:bg-accent/90"
                      : "border border-accent/30 bg-accent/5 text-accent hover:bg-accent/10",
                  )}
                >
                  {isSiteInTrip ? (
                    <>
                      <Check className="size-4" />
                      Added to Trip
                    </>
                  ) : (
                    <>
                      <Route className="size-4" />
                      Add to Trip
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleGetDirections(selectedSite)}
                  disabled={!hasUserMarker || !selectedSitePinned}
                  title={
                    !selectedSitePinned
                      ? "This site has no map pin yet"
                      : hasUserMarker
                        ? undefined
                        : "Enable location to get directions"
                  }
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
