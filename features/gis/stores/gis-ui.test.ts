import { describe, it, expect, beforeEach } from "bun:test"
import { useGisUiStore } from "./gis-ui"

describe("useGisUiStore - Route Planning and Trip Management", () => {
  beforeEach(() => {
    // Reset store state before each test
    useGisUiStore.setState({
      routePlanningMode: false,
      routeStopIds: [],
      activeRoute: null,
      showRouteOnMap: false,
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

  it("removes a site stop and invalidates active route", () => {
    const { addRouteStop, setActiveRoute, removeRouteStop } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")
    setActiveRoute({
      id: "route-1",
      name: "Tour",
      stops: [],
      totalDistanceKm: 10,
      totalDurationMin: 15,
      path: [[120, 14], [121, 14]],
      hasEstimatedEdges: false,
      status: "draft",
      createdAt: null,
    })

    expect(useGisUiStore.getState().showRouteOnMap).toBe(true)

    removeRouteStop("site-1")

    const state = useGisUiStore.getState()
    expect(state.routeStopIds).toEqual(["site-2"])
    expect(state.activeRoute).toBeNull()
    expect(state.showRouteOnMap).toBe(false)
  })

  it("clears all route stops via clearRouteStops", () => {
    const { addRouteStop, clearRouteStops } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")

    clearRouteStops()

    const state = useGisUiStore.getState()
    expect(state.routeStopIds).toEqual([])
    expect(state.activeRoute).toBeNull()
    expect(state.showRouteOnMap).toBe(false)
  })

  it("reorders route stops correctly", () => {
    const { addRouteStop, reorderRouteStops } = useGisUiStore.getState()

    addRouteStop("site-1")
    addRouteStop("site-2")
    addRouteStop("site-3")

    reorderRouteStops(0, 2)

    expect(useGisUiStore.getState().routeStopIds).toEqual(["site-2", "site-3", "site-1"])
  })

  it("handles alternative route options selection and active route synchronization", () => {
    const { setActiveRoute, selectRouteOption } = useGisUiStore.getState()

    setActiveRoute({
      id: "route-1",
      name: "Heritage Tour",
      stops: [
        {
          siteId: "s1",
          siteName: "Site 1",
          latitude: 14,
          longitude: 120,
          stopOrder: 1,
          distanceFromPrevKm: null,
          travelTimeFromPrevMin: null,
          estimatedArrival: null,
          edgeIsEstimated: false,
          thumbnail: null,
          municipalityName: "Taal",
        },
      ],
      totalDistanceKm: 10,
      totalDurationMin: 20,
      path: [[120, 14], [120.1, 14.1]],
      hasEstimatedEdges: false,
      status: "draft",
      createdAt: null,
      options: [
        {
          id: "optimal",
          strategy: "optimal",
          title: "Fastest Route",
          description: "Dijkstra-optimized",
          totalDistanceKm: 10,
          totalDurationMin: 20,
          path: [[120, 14], [120.1, 14.1]],
          stops: [
            {
              siteId: "s1",
              siteName: "Site 1",
              latitude: 14,
              longitude: 120,
              stopOrder: 1,
              distanceFromPrevKm: null,
              travelTimeFromPrevMin: null,
              estimatedArrival: null,
              edgeIsEstimated: false,
              thumbnail: null,
              municipalityName: "Taal",
            },
          ],
          hasEstimatedEdges: false,
        },
        {
          id: "roundtrip",
          strategy: "roundtrip",
          title: "Round-Trip Circuit",
          description: "Returns to start",
          totalDistanceKm: 18,
          totalDurationMin: 35,
          path: [[120, 14], [120.1, 14.1], [120, 14]],
          stops: [
            {
              siteId: "s1",
              siteName: "Site 1",
              latitude: 14,
              longitude: 120,
              stopOrder: 1,
              distanceFromPrevKm: null,
              travelTimeFromPrevMin: null,
              estimatedArrival: null,
              edgeIsEstimated: false,
              thumbnail: null,
              municipalityName: "Taal",
            },
            {
              siteId: "s1",
              siteName: "Site 1",
              latitude: 14,
              longitude: 120,
              stopOrder: 2,
              distanceFromPrevKm: 8,
              travelTimeFromPrevMin: 15,
              estimatedArrival: null,
              edgeIsEstimated: false,
              thumbnail: null,
              municipalityName: "Taal",
            },
          ],
          hasEstimatedEdges: false,
        },
      ],
      selectedOptionIndex: 0,
    })

    expect(useGisUiStore.getState().selectedRouteOptionIndex).toBe(0)
    expect(useGisUiStore.getState().activeRoute?.totalDistanceKm).toBe(10)

    // Select alternative route (index 1: round-trip)
    selectRouteOption(1)

    const updated = useGisUiStore.getState()
    expect(updated.selectedRouteOptionIndex).toBe(1)
    expect(updated.activeRoute?.totalDistanceKm).toBe(18)
    expect(updated.activeRoute?.totalDurationMin).toBe(35)
    expect(updated.activeRoute?.path).toEqual([[120, 14], [120.1, 14.1], [120, 14]])
    expect(updated.activeRoute?.stops).toHaveLength(2)
  })
})
