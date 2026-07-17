"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Route, MapPin, Plus, X, Trash2, ChevronUp, ChevronDown, Navigation, Clock, RotateCcw, Sparkles, LogIn } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useGisUiStore } from "@/features/gis/stores/gis-ui"
import { useCreateRoute } from "../hooks"
import type { OptimizedRoute } from "../types"
import type { SiteWithDistance } from "@/features/gis/hooks/use-nearby-sites"

const STOP_COLORS = [
  "#2E5BFF",
  "#34A853",
  "#F4B400",
  "#EA4335",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
]

interface RoutePlannerPanelProps {
  sites: SiteWithDistance[]
  user: { id: string } | null
}

export default function RoutePlannerPanel({ sites, user }: RoutePlannerPanelProps) {
  const {
    routePlanningMode,
    routeStopIds,
    activeRoute,
    setRoutePlanningMode,
    addRouteStop,
    removeRouteStop,
    reorderRouteStops,
    clearRouteStops,
    setActiveRoute,
  } = useGisUiStore()

  const { create, loading, error } = useCreateRoute()
  const [routeName, setRouteName] = useState("My Heritage Tour")
  const [addQuery, setAddQuery] = useState("")
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)

  const stopSites = useMemo(
    () => routeStopIds.map((id) => sites.find((s) => s.id === id)).filter(Boolean) as SiteWithDistance[],
    [routeStopIds, sites],
  )

  const addableSites = useMemo(
    () => sites.filter((s) => !routeStopIds.includes(s.id)),
    [sites, routeStopIds],
  )

  const filteredAddable = useMemo(
    () =>
      addQuery
        ? addableSites.filter(
            (s) =>
              s.siteName.toLowerCase().includes(addQuery.toLowerCase()) ||
              (s.municipalityName ?? "").toLowerCase().includes(addQuery.toLowerCase()),
          )
        : addableSites,
    [addableSites, addQuery],
  )

  const handleToggleMode = useCallback(() => {
    setRoutePlanningMode(!routePlanningMode)
    setAddQuery("")
    setShowAddDropdown(false)
  }, [routePlanningMode, setRoutePlanningMode])

  const handleAddSite = useCallback(
    (siteId: string) => {
      addRouteStop(siteId)
      setAddQuery("")
      setShowAddDropdown(false)
      addInputRef.current?.focus()
    },
    [addRouteStop],
  )

  const handleOptimize = useCallback(async () => {
    if (routeStopIds.length < 2) return
    const result = await create(routeName, routeStopIds)
    if (result) {
      setActiveRoute(result)
    }
  }, [routeStopIds, routeName, create, setActiveRoute])

  const handleClearAll = useCallback(() => {
    clearRouteStops()
    setRouteName("My Heritage Tour")
  }, [clearRouteStops])

  const totalDistance = activeRoute?.totalDistanceKm ?? null
  const totalDuration = activeRoute?.totalDurationMin ?? null

  return (
    <div className="border-b border-ink/10">
      <button
        type="button"
        onClick={handleToggleMode}
        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
          routePlanningMode ? "text-accent bg-accent/5" : "text-ink-soft hover:text-ink"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Route className="size-3" />
          Route Planner
        </span>
        <span className="flex items-center gap-2">
          {routeStopIds.length > 0 && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
              {routeStopIds.length}
            </span>
          )}
          <span className={`inline-block size-3 rounded border ${
            routePlanningMode ? "bg-accent border-accent" : "border-ink/30 bg-cream"
          }`}>
            {routePlanningMode && (
              <svg className="size-full text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            )}
          </span>
        </span>
      </button>

      <AnimatePresence>
        {routePlanningMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-3">
              {/* Route name */}
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Route name..."
                className="w-full rounded-xl border border-ink/10 bg-cream px-3 py-1.5 text-xs focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50"
                aria-label="Route name"
              />

              {/* Stop list */}
              <div className="space-y-1">
                {stopSites.length === 0 && (
                  <p className="py-3 text-center text-[11px] text-ink-soft/60">
                    Click sites on the map or use the search below to add stops.
                  </p>
                )}
                {stopSites.map((site, i) => (
                  <div
                    key={site.id}
                    className="flex items-center gap-2 rounded-lg border border-ink/10 bg-card px-2.5 py-1.5"
                  >
                    <span
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: STOP_COLORS[i % STOP_COLORS.length] }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">{site.siteName}</p>
                      <p className="truncate text-[10px] text-ink-soft">{site.municipalityName ?? ""}</p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        onClick={() => reorderRouteStops(i, i - 1)}
                        disabled={i === 0}
                        className="grid size-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20"
                        aria-label="Move stop up"
                      >
                        <ChevronUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderRouteStops(i, i + 1)}
                        disabled={i === stopSites.length - 1}
                        className="grid size-5 place-items-center rounded text-ink-soft hover:text-ink disabled:opacity-20"
                        aria-label="Move stop down"
                      >
                        <ChevronDown className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRouteStop(site.id)}
                        className="grid size-5 place-items-center rounded text-ink-soft hover:text-red-500"
                        aria-label={`Remove ${site.siteName}`}
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add stop search */}
              <div className="relative">
                <div className="relative">
                  <Plus className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft" />
                  <input
                    ref={addInputRef}
                    type="text"
                    placeholder="Add a stop..."
                    value={addQuery}
                    onChange={(e) => { setAddQuery(e.target.value); setShowAddDropdown(true) }}
                    onFocus={() => setShowAddDropdown(true)}
                    className="w-full rounded-xl border border-ink/10 bg-cream py-1.5 pl-8 pr-3 text-xs focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/50"
                    aria-label="Search sites to add"
                  />
                </div>
                <AnimatePresence>
                  {showAddDropdown && filteredAddable.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute inset-x-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-xl border border-ink/10 bg-card shadow-lg"
                    >
                      {filteredAddable.slice(0, 8).map((site) => (
                        <button
                          key={site.id}
                          type="button"
                          onClick={() => handleAddSite(site.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-parchment/60 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <MapPin className="size-3 shrink-0 text-accent" />
                          <span className="truncate text-ink">{site.siteName}</span>
                          <span className="ml-auto text-[10px] text-ink-soft">{site.municipalityName ?? ""}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Route actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleOptimize}
                  disabled={routeStopIds.length < 2 || loading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {loading ? "Optimizing..." : "Optimize Route"}
                </button>
                {routeStopIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center justify-center gap-1 rounded-xl border border-ink/10 bg-card px-3 py-2 text-[11px] text-ink-soft transition-colors hover:text-ink"
                  >
                    <Trash2 className="size-3" />
                    Clear
                  </button>
                )}
              </div>

              {error && (
                <p className="text-[11px] text-error" role="alert">{error}</p>
              )}

              {/* Route result */}
              {activeRoute && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="size-3 text-accent" />
                      <span className="text-xs font-semibold text-ink">
                        {totalDistance != null ? `${totalDistance} km` : "—"}
                      </span>
                    </div>
                    <span className="text-ink/20">·</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-accent" />
                      <span className="text-xs font-semibold text-ink">
                        {totalDuration != null ? `~${totalDuration} min` : "—"}
                      </span>
                    </div>
                    <span className="text-ink/20">·</span>
                    <span className="text-xs text-ink-soft">{activeRoute.stops.length} stops</span>
                  </div>
                  {activeRoute.hasEstimatedEdges && (
                    <p className="mt-1 text-[10px] text-ink-soft/60">
                      Some distances estimated (Haversine)
                    </p>
                  )}
                  {!user && (
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-soft/60">
                      <LogIn className="size-3" />
                      <span>Log in to save this route to your profile.</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
