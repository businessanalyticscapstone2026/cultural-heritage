import type { RouteOptionKind } from "./types"

/**
 * How each route option looks in the planner and on the map.
 * Color is never the only signal: every option also has a label, an icon
 * and (on the map) a line style. `color` is for the map line; the Tailwind
 * classes are the same colors for the planner cards and map markers.
 */
export const ROUTE_OPTION_META: Record<
  RouteOptionKind,
  { label: string; description: string; color: string; barClass: string; fillClass: string }
> = {
  shortest: { label: "Shortest", description: "Least total travel distance", color: "#16A34A", barClass: "bg-green-600", fillClass: "fill-green-600" },
  fastest: { label: "Fastest", description: "Least total travel time", color: "#2563EB", barClass: "bg-blue-600", fillClass: "fill-blue-600" },
  balanced: { label: "Balanced", description: "Good mix of short, fast and few town changes", color: "#D97706", barClass: "bg-amber-600", fillClass: "fill-amber-600" },
  highlights: { label: "Highlights first", description: "Best-rated sites earlier, within the time limit", color: "#7C3AED", barClass: "bg-violet-600", fillClass: "fill-violet-600" },
  "one-town": { label: "One town at a time", description: "Finish one town before moving on", color: "#0D9488", barClass: "bg-teal-600", fillClass: "fill-teal-600" },
  "my-order": { label: "My order", description: "The order you picked", color: "#6B7280", barClass: "bg-gray-500", fillClass: "fill-gray-500" },
}

/** Order the cards appear in. */
export const ROUTE_OPTION_ORDER: RouteOptionKind[] = ["shortest", "fastest", "balanced", "highlights", "one-town", "my-order"]

/**
 * Weights for the "Balanced" option. Each total is first scaled to 0..1
 * (0 = best value among the candidate routes, 1 = worst), then mixed with
 * these weights. Change them here to tune Balanced.
 */
export const BALANCED_WEIGHTS = { time: 0.4, distance: 0.4, townChanges: 0.2 }

/** Rating given to a site with no reviews (0..1 scale, 0.5 = neutral). */
export const NEUTRAL_RATING = 0.5

/** Up to this many points (stops + optional "my location") we find the exact best order. */
export const EXACT_SOLVER_MAX_POINTS = 11

/** Rough box around Batangas. Coordinates outside it are treated as wrong. */
export const BATANGAS_BOUNDS = { minLat: 13.4, maxLat: 14.2, minLng: 120.4, maxLng: 121.4 }

/** Used only when the road router is offline: straight line x factor, at this speed. */
export const FALLBACK_ROAD_FACTOR = 1.3
export const FALLBACK_SPEED_KMH = 40

/** "Auto" travel mode walks when no two points are farther apart than this (straight line). */
export const AUTO_WALK_MAX_KM = 2

/** How long road distance tables stay in memory. */
export const MATRIX_CACHE_TTL_MS = 10 * 60 * 1000
