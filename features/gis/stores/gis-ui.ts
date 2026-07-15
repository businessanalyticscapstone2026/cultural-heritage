import { create } from "zustand"

interface GisUiState {
  selectedSiteId: string | null
  isDetailOpen: boolean
  categoryFilter: string
  searchQuery: string
  sidebarOpen: boolean
  visibleCategoryIds: string[]

  selectSite: (siteId: string | null) => void
  openDetail: (siteId: string) => void
  closeDetail: () => void
  setCategoryFilter: (id: string) => void
  setSearchQuery: (q: string) => void
  toggleSidebar: () => void
  setVisibleCategoryIds: (ids: string[]) => void
}

export const useGisUiStore = create<GisUiState>((set) => ({
  selectedSiteId: null,
  isDetailOpen: false,
  categoryFilter: "all",
  searchQuery: "",
  sidebarOpen: true,
  visibleCategoryIds: [],

  selectSite: (siteId) => set({ selectedSiteId: siteId }),

  openDetail: (siteId) =>
    set({ selectedSiteId: siteId, isDetailOpen: true }),

  closeDetail: () =>
    set({ selectedSiteId: null, isDetailOpen: false }),

  setCategoryFilter: (id) => set({ categoryFilter: id }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setVisibleCategoryIds: (ids) => set({ visibleCategoryIds: ids }),
}))
