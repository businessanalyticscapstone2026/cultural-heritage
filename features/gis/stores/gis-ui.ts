import { create } from "zustand"
import type { OptimizedRoute } from "@/features/route-optimization/types"

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
  activeRoute: OptimizedRoute | null
  showRouteOnMap: boolean

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
  setActiveRoute: (route: OptimizedRoute | null) => void
  setShowRouteOnMap: (show: boolean) => void
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
  showStatsPanel: true,
  showNearbyPanel: true,
  showCuratedTrails: true,
  showRecommended: false,
  recommendedSiteIds: [],

  routePlanningMode: false,
  routeStopIds: [],
  activeRoute: null,
  showRouteOnMap: false,

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
    set({
      routePlanningMode: mode,
      activeRoute: mode ? null : null,
      showRouteOnMap: false,
      routeStopIds: mode ? [] : [],
    }),

  addRouteStop: (siteId) =>
    set((state) => {
      if (state.routeStopIds.includes(siteId)) return state
      return { routeStopIds: [...state.routeStopIds, siteId] }
    }),

  removeRouteStop: (siteId) =>
    set((state) => ({
      routeStopIds: state.routeStopIds.filter((id) => id !== siteId),
      activeRoute: null,
      showRouteOnMap: false,
    })),

  reorderRouteStops: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.routeStopIds]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { routeStopIds: next, activeRoute: null, showRouteOnMap: false }
    }),

  clearRouteStops: () =>
    set({ routeStopIds: [], activeRoute: null, showRouteOnMap: false }),

  setActiveRoute: (route) =>
    set({ activeRoute: route, showRouteOnMap: route !== null }),

  setShowRouteOnMap: (show) => set({ showRouteOnMap: show }),
}))
