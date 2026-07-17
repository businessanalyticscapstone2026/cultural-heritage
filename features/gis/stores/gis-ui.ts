import { create } from "zustand"

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
}))
