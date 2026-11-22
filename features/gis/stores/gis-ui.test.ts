import { describe, it, expect, beforeEach } from "bun:test"
import { useGisUiStore } from "./gis-ui"

describe("useGisUiStore - Route Planning and Trip Management", () => {
  beforeEach(() => {
    // Reset store state before each test
    useGisUiStore.setState({
      routePlanningMode: false,
      routeStopIds: [],
      showRouteOnMap: false,
      selectedOptionKind: null,
      routeOrderEdited: false,
      selectedSiteId: null,
      isDetailOpen: false,
    })
  })

  it("adds a site to routeStopIds without duplicates", () => {
    const { addRouteStop } = useGisUiStore.getState()

    addRouteStop("site-1")
    expect(useGisUiStore.getState().routeStopIds).toEqual(["site-1"])

    addRouteStop("site-2")
    expect(useGisUiStore.getState().routeStopIds).toEqual(["site-1", "site-2"])

    // Duplicate add should be ignored
    addRouteStop("site-1")
    expect(useGisUiStore.getState().routeStopIds).toEqual(["site-1", "site-2"])
  })

  it("preserves routeStopIds when setRoutePlanningMode(true) is called", () => {
    const { addRouteStop, setRoutePlanningMode } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")

    // Enabling route planning mode must NOT wipe routeStopIds
    setRoutePlanningMode(true)

    const state = useGisUiStore.getState()
    expect(state.routePlanningMode).toBe(true)
    expect(state.routeStopIds).toEqual(["site-1", "site-2"])
  })

  it("preserves routeStopIds when setRoutePlanningMode(false) is called", () => {
    const { addRouteStop, setRoutePlanningMode } = useGisUiStore.getState()

    addRouteStop("site-1")
    setRoutePlanningMode(true)
    setRoutePlanningMode(false)

    const state = useGisUiStore.getState()
    expect(state.routePlanningMode).toBe(false)
    expect(state.routeStopIds).toEqual(["site-1"])
    expect(state.showRouteOnMap).toBe(false)
  })

  it("removes a site stop and hides the route options on the map", () => {
    const { addRouteStop, setShowRouteOnMap, setSelectedOptionKind, removeRouteStop } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")
    setShowRouteOnMap(true)
    setSelectedOptionKind("fastest")

    removeRouteStop("site-1")

    const state = useGisUiStore.getState()
    expect(state.routeStopIds).toEqual(["site-2"])
    expect(state.selectedOptionKind).toBeNull()
    expect(state.showRouteOnMap).toBe(false)
  })

  it("clears all route stops via clearRouteStops", () => {
    const { addRouteStop, clearRouteStops } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")

    clearRouteStops()

    const state = useGisUiStore.getState()
    expect(state.routeStopIds).toEqual([])
    expect(state.routeOrderEdited).toBe(false)
    expect(state.showRouteOnMap).toBe(false)
  })

  it("reorders route stops correctly", () => {
    const { addRouteStop, reorderRouteStops } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")
    addRouteStop("site-3")

    reorderRouteStops(0, 2)

    expect(useGisUiStore.getState().routeStopIds).toEqual(["site-2", "site-3", "site-1"])
    // Moving a stop by hand turns on the "My order" option and clears the selection.
    expect(useGisUiStore.getState().routeOrderEdited).toBe(true)
    expect(useGisUiStore.getState().selectedOptionKind).toBeNull()
  })
})
