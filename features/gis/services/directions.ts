export interface DrivingDirections {
  /** Road-following route geometry as [longitude, latitude] pairs. */
  coordinates: [number, number][]
  distanceKm: number
  durationMin: number
}

// Public OSRM demo endpoint — no API key, rate-limited for light/demo use.
// Swap for a self-hosted OSRM (or other routing provider) instance before
// relying on this for production-scale traffic.
const OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving"

/**
 * Fetches a road-following driving route between two points via OSRM
 * (OpenStreetMap-based routing), matching the project's existing OSM basemap.
 * Returns null on any failure so callers can fall back to a straight line.
 */
export async function fetchDrivingDirections(
  origin: [number, number],
  destination: [number, number],
): Promise<DrivingDirections | null> {
  const url = `${OSRM_ROUTE_URL}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&geometries=geojson`

  try {
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    const route = data.routes?.[0]
    if (!route?.geometry?.coordinates) return null

    return {
      coordinates: route.geometry.coordinates as [number, number][],
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    }
  } catch {
    return null
  }
}
