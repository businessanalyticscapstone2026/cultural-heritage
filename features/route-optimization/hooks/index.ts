"use client"

import { useState, useCallback } from "react"
import { useGisUiStore } from "@/features/gis/stores/gis-ui"
import type {
  OptimizedRoute,
  GenerateRouteOptionsInput,
  RouteOptionsResult,
  RouteOption,
  RouteStartMode,
} from "../types"
import {
  createRouteAction,
  listRoutesAction,
  getRouteAction,
  completeRouteAction,
  generateRouteOptionsAction,
  saveRouteAction,
} from "../actions"

/**
 * Route options for the current planner inputs.
 * `requestKey` describes the stops and settings; when it changes, the old
 * options are dropped (so moving, adding or removing a stop clears them).
 */
export function useRouteOptions(requestKey: string) {
  const [state, setState] = useState<{ key: string; result: RouteOptionsResult | null; error: string | null }>({
    key: "",
    result: null,
    error: null,
  })
  const [loading, setLoading] = useState(false)

  const generate = useCallback(
    async (input: GenerateRouteOptionsInput) => {
      setLoading(true)
      setState({ key: requestKey, result: null, error: null })
      try {
        const response = await generateRouteOptionsAction(input)
        setState(
          response.ok
            ? { key: requestKey, result: response.data, error: null }
            : { key: requestKey, result: null, error: response.error },
        )
      } catch (e) {
        setState({ key: requestKey, result: null, error: e instanceof Error ? e.message : "Could not find routes" })
      } finally {
        setLoading(false)
      }
    },
    [requestKey],
  )

  const current = state.key === requestKey
  return { result: current ? state.result : null, error: current ? state.error : null, loading, generate }
}

/**
 * Everything the planner and the map need about route options for the
 * current stops: the options, the selected one, and `findRoutes()`.
 * Pass the tourist's location, or nulls when it is not known.
 */
export function useRoutePlanner(latitude: number | null, longitude: number | null) {
  const {
    routeStopIds,
    routeStartMode,
    routeRoundTrip,
    routeTravelMode,
    routeOrderEdited,
    selectedOptionKind,
    setShowRouteOnMap,
  } = useGisUiStore()
  const hasLocation = latitude !== null && longitude !== null

  // Default: start at my location when we know it, else let the solver pick.
  const startMode: RouteStartMode =
    routeStartMode === "origin" && !hasLocation ? "best" : (routeStartMode ?? (hasLocation ? "origin" : "best"))

  const requestKey = JSON.stringify([routeStopIds, startMode, routeRoundTrip, routeTravelMode, routeOrderEdited])
  const { result, error, loading, generate } = useRouteOptions(requestKey)

  const findRoutes = useCallback(async () => {
    await generate({
      siteIds: routeStopIds,
      startMode,
      origin: startMode === "origin" && latitude !== null && longitude !== null ? { latitude, longitude } : null,
      roundTrip: routeRoundTrip,
      travelMode: routeTravelMode,
      includeMyOrder: routeOrderEdited,
    })
    setShowRouteOnMap(true)
  }, [
    generate,
    routeStopIds,
    startMode,
    latitude,
    longitude,
    routeRoundTrip,
    routeTravelMode,
    routeOrderEdited,
    setShowRouteOnMap,
  ])

  const wanted = selectedOptionKind ?? result?.recommendedKind
  const selectedOption = result
    ? (result.options.find((o) => wanted && o.labels.includes(wanted)) ?? result.options[0] ?? null)
    : null

  return { result, error, loading, findRoutes, startMode, hasLocation, selectedOption }
}

export type RoutePlanner = ReturnType<typeof useRoutePlanner>

/** Saves one route option. `saved` tells which option object was saved last (new results start unsaved). */
export function useSaveRoute() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<{ option: RouteOption; id: string } | null>(null)

  const save = useCallback(async (name: string, option: RouteOption) => {
    setSaving(true)
    setError(null)
    try {
      const response = await saveRouteAction({
        name,
        totalDistanceKm: option.totalDistanceKm,
        totalDurationMin: option.totalDurationMin,
        stops: option.stops.map((s) => ({
          siteId: s.siteId,
          distanceFromPrevKm: s.distanceFromPrevKm,
          travelTimeFromPrevMin: s.travelTimeFromPrevMin,
        })),
      })
      if (response.ok) setSaved({ option, id: response.data.id })
      else setError(response.error)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the route")
    } finally {
      setSaving(false)
    }
  }, [])

  return { save, saving, error, saved }
}

export function useCreateRoute() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (
    name: string,
    siteIds: string[],
  ): Promise<OptimizedRoute | null> => {
    setLoading(true)
    setError(null)
    try {
      const route = await createRouteAction({ name, siteIds })
      return route
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create route"
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { create, loading, error }
}

export function useRoutes() {
  const [routes, setRoutes] = useState<OptimizedRoute[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const list = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listRoutesAction()
      setRoutes(result)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load routes"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback(async (routeId: string): Promise<OptimizedRoute | null> => {
    setLoading(true)
    setError(null)
    try {
      return await getRouteAction(routeId)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load route"
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const complete = useCallback(async (routeId: string) => {
    setError(null)
    try {
      await completeRouteAction(routeId)
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? { ...r, status: "completed" as const } : r)),
      )
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to complete route"
      setError(message)
    }
  }, [])

  return { routes, list, get, complete, loading, error }
}
