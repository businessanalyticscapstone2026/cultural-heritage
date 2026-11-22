import { haversineDistance } from "@/utils/geo"
import { WALKING_SPEED_KMH } from "@/lib/constants"
import { osrmUrl, type OsrmProfile } from "@/features/gis/services/directions"
import {
  BATANGAS_BOUNDS,
  FALLBACK_ROAD_FACTOR,
  FALLBACK_SPEED_KMH,
  MATRIX_CACHE_TTL_MS,
} from "../constants"

export interface MatrixPoint {
  id: string
  latitude: number
  longitude: number
}

/** Road distance (km) and time (min) between every pair of points, in the order given. */
export interface RoadMatrix {
  distanceKm: number[][]
  durationMin: number[][]
  /** True when some values are straight-line estimates (road router failed). */
  estimated: boolean
}

/**
 * Why a site cannot be placed on a route, or null if its coordinates look fine.
 * We never guess missing coordinates.
 */
export function coordinateProblem(latitude: number | null, longitude: number | null): string | null {
  if (latitude == null || longitude == null) return "No map location"
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) return "No map location"
  const b = BATANGAS_BOUNDS
  if (lat < b.minLat || lat > b.maxLat || lng < b.minLng || lng > b.maxLng) return "Map location is outside Batangas"
  return null
}

// shortcut: in-memory cache lives per server instance only; move to a shared cache if we run many instances.
const cache = new Map<string, { expires: number; matrix: RoadMatrix }>()

export function clearMatrixCache(): void {
  cache.clear()
}

/**
 * Road distances and times between all points, from OSRM (OpenStreetMap roads).
 * If OSRM fails, falls back to straight-line distance x 1.3 at 40 km/h (5 km/h walking) and marks the
 * result `estimated`. Good results are cached for 10 minutes; estimates are not.
 */
export async function getRoadMatrix(points: MatrixPoint[], profile: OsrmProfile = "driving"): Promise<RoadMatrix> {
  // Sort by id so the same set of points always hits the same cache entry.
  const sorted = [...points].sort((a, b) => a.id.localeCompare(b.id))
  const key = `${profile}:${sorted.map((p) => p.id).join("|")}`

  const cached = cache.get(key)
  let sortedMatrix = cached && cached.expires > Date.now() ? cached.matrix : null
  if (!sortedMatrix) {
    sortedMatrix = await fetchOsrmTable(sorted, profile)
    if (!sortedMatrix.estimated) cache.set(key, { expires: Date.now() + MATRIX_CACHE_TTL_MS, matrix: sortedMatrix })
  }

  // Put rows and columns back in the caller's order.
  const position = points.map((p) => sorted.findIndex((s) => s.id === p.id))
  const reorder = (m: number[][]) => position.map((i) => position.map((j) => m[i][j]))
  return {
    distanceKm: reorder(sortedMatrix.distanceKm),
    durationMin: reorder(sortedMatrix.durationMin),
    estimated: sortedMatrix.estimated,
  }
}

function straightLineKm(a: MatrixPoint, b: MatrixPoint): number {
  return haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude) * FALLBACK_ROAD_FACTOR
}

async function fetchOsrmTable(points: MatrixPoint[], profile: OsrmProfile): Promise<RoadMatrix> {
  const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(";")
  const url = `${osrmUrl("table", profile)}/${coords}?annotations=distance,duration`
  const fallbackSpeedKmh = profile === "walking" ? WALKING_SPEED_KMH : FALLBACK_SPEED_KMH

  let distances: (number | null)[][] | null = null
  let durations: (number | null)[][] | null = null
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (response.ok) {
      const data = await response.json()
      if (data.code === "Ok" && Array.isArray(data.distances) && Array.isArray(data.durations)) {
        distances = data.distances
        durations = data.durations
      }
    }
  } catch (error) {
    console.error("[Route] OSRM table request failed, using estimates:", error instanceof Error ? error.message : error)
  }

  let estimated = distances === null
  const distanceKm: number[][] = []
  const durationMin: number[][] = []
  for (let i = 0; i < points.length; i++) {
    distanceKm.push([])
    durationMin.push([])
    for (let j = 0; j < points.length; j++) {
      const meters = distances?.[i]?.[j]
      const seconds = durations?.[i]?.[j]
      if (typeof meters === "number" && typeof seconds === "number") {
        distanceKm[i].push(meters / 1000)
        durationMin[i].push(seconds / 60)
      } else {
        // OSRM could not route this pair (or is offline): use a straight-line estimate.
        if (i !== j) estimated = true
        const km = i === j ? 0 : straightLineKm(points[i], points[j])
        distanceKm[i].push(km)
        durationMin[i].push((km / fallbackSpeedKmh) * 60)
      }
    }
  }
  return { distanceKm, durationMin, estimated }
}
