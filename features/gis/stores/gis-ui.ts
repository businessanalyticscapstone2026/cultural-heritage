import { create } from "zustand"
import type { RouteOptionKind, RouteStartMode, RouteTravelMode } from "@/features/route-optimization/types"

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

interface GisUiState {
  selectedSiteId: string | null
  isDetailOpen: boolean
  categoryFilter: string
  searchQuery: string
  sidebarOpen: boolean
  visibleCategoryIds: string[]

  showEntryState: boolean
  mapBounds: MapBounds | null
  showStatsPanel: boolean
  showNearbyPanel: boolean
  showCuratedTrails: boolean
  showRecommended: boolean
  recommendedSiteIds: string[]

  routePlanningMode: boolean
  routeStopIds: string[]
  showRouteOnMap: boolean
  /** Route option card the tourist picked (null = the recommended one). */
  selectedOptionKind: RouteOptionKind | null
  /** Draw every route option on the map, not only the selected one. */
  compareAllRoutes: boolean
  /** Where the route starts (null = automatic: my location if known, else best start). */
  routeStartMode: RouteStartMode | null
  routeRoundTrip: boolean
  routeTravelMode: RouteTravelMode
  /** True once the tourist moved a stop by hand (shows the "My order" option). */
  routeOrderEdited: boolean

  selectSite: (siteId: string | null) => void
  openDetail: (siteId: string) => void
  closeDetail: () => void
  setCategoryFilter: (id: string) => void
  setSearchQuery: (q: string) => void
  toggleSidebar: () => void
  setVisibleCategoryIds: (ids: string[]) => void
  dismissEntryState: () => void
  setMapBounds: (bounds: MapBounds | null) => void
  setShowStatsPanel: (show: boolean) => void
  setShowNearbyPanel: (show: boolean) => void
  setShowCuratedTrails: (show: boolean) => void
  setShowRecommended: (show: boolean) => void
  setRecommendedSiteIds: (ids: string[]) => void

  setRoutePlanningMode: (mode: boolean) => void
  addRouteStop: (siteId: string) => void
  removeRouteStop: (siteId: string) => void
  reorderRouteStops: (fromIndex: number, toIndex: number) => void
  clearRouteStops: () => void
  setShowRouteOnMap: (show: boolean) => void
  setSelectedOptionKind: (kind: RouteOptionKind | null) => void
  setCompareAllRoutes: (compare: boolean) => void
  setRouteStartMode: (mode: RouteStartMode) => void
  setRouteRoundTrip: (roundTrip: boolean) => void
  setRouteTravelMode: (mode: RouteTravelMode) => void
}

export const useGisUiStore = create<GisUiState>((set) => ({
  selectedSiteId: null,
  isDetailOpen: false,
  categoryFilter: "all",
  searchQuery: "",
  sidebarOpen: true,
  visibleCategoryIds: [],

  showEntryState: true,
  mapBounds: null,
  showStatsPanel: false,
  showNearbyPanel: true,
  showCuratedTrails: false,
  showRecommended: false,
  recommendedSiteIds: [],

  routePlanningMode: false,
  routeStopIds: [],
  showRouteOnMap: false,
  selectedOptionKind: null,
  compareAllRoutes: false,
  routeStartMode: null,
  routeRoundTrip: false,
  routeTravelMode: "auto",
  routeOrderEdited: false,

  selectSite: (siteId) => set({ selectedSiteId: siteId }),

  openDetail: (siteId) =>
    set({ selectedSiteId: siteId, isDetailOpen: true }),

  closeDetail: () =>
    set({ selectedSiteId: null, isDetailOpen: false }),

  setCategoryFilter: (id) => set({ categoryFilter: id }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setVisibleCategoryIds: (ids) => set({ visibleCategoryIds: ids }),

  dismissEntryState: () => set({ showEntryState: false }),

  setMapBounds: (bounds) => set({ mapBounds: bounds }),

  setShowStatsPanel: (show) => set({ showStatsPanel: show }),

  setShowNearbyPanel: (show) => set({ showNearbyPanel: show }),

  setShowCuratedTrails: (show) => set({ showCuratedTrails: show }),
  setShowRecommended: (show) => set({ showRecommended: show }),
  setRecommendedSiteIds: (ids) => set({ recommendedSiteIds: ids }),

  setRoutePlanningMode: (mode) =>
    set((state) => ({
      routePlanningMode: mode,
      ...(!mode ? { showRouteOnMap: false } : {}),
    })),

  addRouteStop: (siteId) =>
    set((state) => {
      if (state.routeStopIds.includes(siteId)) return state
      return { routeStopIds: [...state.routeStopIds, siteId] }
    }),

  removeRouteStop: (siteId) =>
    set((state) => ({
      routeStopIds: state.routeStopIds.filter((id) => id !== siteId),
      showRouteOnMap: false,
      selectedOptionKind: null,
    })),

  reorderRouteStops: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.routeStopIds]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { routeStopIds: next, showRouteOnMap: false, selectedOptionKind: null, routeOrderEdited: true }
    }),

  clearRouteStops: () =>
    set({ routeStopIds: [], showRouteOnMap: false, selectedOptionKind: null, routeOrderEdited: false }),

  setShowRouteOnMap: (show) => set({ showRouteOnMap: show }),
  setSelectedOptionKind: (kind) => set({ selectedOptionKind: kind }),
  setCompareAllRoutes: (compare) => set({ compareAllRoutes: compare }),
  setRouteStartMode: (mode) => set({ routeStartMode: mode, showRouteOnMap: false, selectedOptionKind: null }),
  setRouteRoundTrip: (roundTrip) => set({ routeRoundTrip: roundTrip, showRouteOnMap: false, selectedOptionKind: null }),
  setRouteTravelMode: (mode) => set({ routeTravelMode: mode, showRouteOnMap: false, selectedOptionKind: null }),
}))
