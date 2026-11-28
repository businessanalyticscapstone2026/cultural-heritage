"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Route, MapPin, Plus, X, Trash2, ChevronUp, ChevronDown, Sparkles, Info } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useGisUiStore } from "@/features/gis/stores/gis-ui"
import { useSaveRoute, type RoutePlanner } from "../hooks"
import type { RouteStartMode, RouteTravelMode } from "../types"
import type { SiteWithDistance } from "@/features/gis/hooks/use-nearby-sites"
import RouteOptionsList, { RouteOptionsSkeleton } from "./route-options-list"

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

const START_MODES: { value: RouteStartMode; label: string }[] = [
  { value: "origin", label: "My location" },
  { value: "best", label: "Best start" },
  { value: "first", label: "First stop" },
]

const TRAVEL_MODES: { value: RouteTravelMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "walking", label: "Walk" },
  { value: "driving", label: "Drive" },
]

interface RoutePlannerPanelProps {
  sites: SiteWithDistance[]
  user: { id: string } | null
  /** Route options state, shared with the map (see useRoutePlanner). */
  planner: RoutePlanner
}

export default function RoutePlannerPanel({ sites, user, planner }: RoutePlannerPanelProps) {
  const {
    routePlanningMode,
    routeStopIds,
    routeRoundTrip,
    routeTravelMode,
    compareAllRoutes,
    setRoutePlanningMode,
    addRouteStop,
    removeRouteStop,
    reorderRouteStops,
    clearRouteStops,
    setRouteStartMode,
    setRouteRoundTrip,
    setRouteTravelMode,
    setSelectedOptionKind,
    setCompareAllRoutes,
  } = useGisUiStore()

  const { result, error, loading, findRoutes, startMode, hasLocation, selectedOption } = planner
  const saver = useSaveRoute()
  const isSaved = saver.saved !== null && saver.saved.option === selectedOption
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
      // Focus first: focusing opens the list, so close it afterwards.
      addInputRef.current?.focus()
      setShowAddDropdown(false)
    },
    [addRouteStop],
  )

  const handleSave = useCallback(() => {
    if (selectedOption) saver.save(routeName, selectedOption)
  }, [saver, routeName, selectedOption])

  const handleClearAll = useCallback(() => {
    clearRouteStops()
    setRouteName("My Heritage Tour")
  }, [clearRouteStops])

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
                    Select sites on the map and click &quot;Add to Trip&quot;, or use the search below to add stops.
                  </p>
                )}
                {stopSites.map((site, i) => {
                  const activeStop = selectedOption?.stops.find((s) => s.siteId === site.id)
                  const isReordered = activeStop && activeStop.stopOrder !== i + 1
                  return (
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
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-medium text-ink">{site.siteName}</p>
                          {activeStop && isReordered && (
                            <span
                              className="shrink-0 rounded bg-accent/15 px-1 py-0.2 text-[9px] font-bold text-accent"
                              title={`Visits as stop #${activeStop.stopOrder} on the map route`}
                            >
                              Map #{activeStop.stopOrder}
                            </span>
                          )}
                        </div>
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
                  )
                })}
              </div>

              {/* Add stop search */}
              <div
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setShowAddDropdown(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowAddDropdown(false)
                }}
              >
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
                      // Keep focus in the search box while clicking a result (Safari does not focus buttons on click).
                      onMouseDown={(e) => e.preventDefault()}
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

              {/* Start point and round trip */}
              <fieldset className="space-y-1">
                <legend className="text-[11px] font-medium text-ink-soft">Start from</legend>
                <div className="flex gap-1">
                  {START_MODES.filter((m) => m.value !== "origin" || hasLocation).map((m) => (
                    <label
                      key={m.value}
                      className={cn(
                        "flex-1 cursor-pointer rounded-lg border px-1.5 py-1 text-center text-[11px] transition-colors has-focus-visible:ring-3 has-focus-visible:ring-accent/50",
                        startMode === m.value ? "border-ink bg-ink text-white" : "border-ink/15 bg-card text-ink hover:border-ink/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="route-start-mode"
                        value={m.value}
                        checked={startMode === m.value}
                        onChange={() => setRouteStartMode(m.value)}
                        className="sr-only"
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="space-y-1">
                <legend className="text-[11px] font-medium text-ink-soft">Travel by</legend>
                <div className="flex gap-1">
                  {TRAVEL_MODES.map((m) => (
                    <label
                      key={m.value}
                      className={cn(
                        "flex-1 cursor-pointer rounded-lg border px-1.5 py-1 text-center text-[11px] transition-colors has-focus-visible:ring-3 has-focus-visible:ring-accent/50",
                        routeTravelMode === m.value ? "border-ink bg-ink text-white" : "border-ink/15 bg-card text-ink hover:border-ink/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="route-travel-mode"
                        value={m.value}
                        checked={routeTravelMode === m.value}
                        onChange={() => setRouteTravelMode(m.value)}
                        className="sr-only"
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
                {routeTravelMode === "auto" && result && (
                  <p className="text-[10px] text-ink-soft">
                    {result.travelMode === "walking" ? "Walking: stops are close together." : "Driving: stops are far apart."}
                  </p>
                )}
              </fieldset>
              <label className="flex cursor-pointer items-center justify-between text-[11px] text-ink">
                <span>Return to start</span>
                <Switch size="sm" checked={routeRoundTrip} onCheckedChange={(checked) => setRouteRoundTrip(checked)} />
              </label>

              {/* Route actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={findRoutes}
                  disabled={routeStopIds.length < 2 || loading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-medium text-white transition-all hover:bg-accent/90 focus-visible:ring-3 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  {loading ? "Finding routes..." : "Find best routes"}
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
              {routeStopIds.length < 2 && stopSites.length > 0 && (
                <p className="text-[11px] text-ink-soft">Add at least 2 stops to find routes.</p>
              )}

              {error && (
                <p className="text-[11px] text-red-700" role="alert">{error}</p>
              )}

              {loading && <RouteOptionsSkeleton />}

              {result && (
                <div className="space-y-2">
                  {result.excludedSites.length > 0 && (
                    <p className="flex gap-1 rounded-lg border border-ink/10 bg-parchment/60 p-2 text-[11px] text-ink">
                      <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                      <span>
                        {result.excludedSites.length} site{result.excludedSites.length === 1 ? " was" : "s were"} left out
                        because {result.excludedSites.length === 1 ? "it has" : "they have"} no usable map location:{" "}
                        {result.excludedSites.map((s) => s.name).join(", ")}.
                      </span>
                    </p>
                  )}
                  {result.warnings.map((w) => (
                    <p key={w} className="text-[11px] text-ink-soft">{w}</p>
                  ))}
                  <RouteOptionsList
                    result={result}
                    selected={selectedOption}
                    onSelect={setSelectedOptionKind}
                    compareAll={compareAllRoutes}
                    onCompareAllChange={setCompareAllRoutes}
                    canSave={user !== null}
                    onSave={handleSave}
                    saving={saver.saving}
                    saveError={isSaved ? null : saver.error}
                    savedId={isSaved ? saver.saved!.id : null}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
