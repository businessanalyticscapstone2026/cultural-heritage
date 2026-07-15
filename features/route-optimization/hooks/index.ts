"use client"

import { useState, useCallback } from "react"
import type { OptimizedRoute } from "../types"
import { createRouteAction, listRoutesAction, getRouteAction, completeRouteAction } from "../actions"

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
