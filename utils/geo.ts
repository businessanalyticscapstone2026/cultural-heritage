export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

export function getBoundsFromViewport(
  centerLng: number,
  centerLat: number,
  zoom: number,
): Bounds {
  const worldWidth = 360
  const worldHeight = 170
  const extent = Math.pow(2, zoom)
  const lngSpan = worldWidth / extent
  const latSpan = worldHeight / extent
  return {
    north: Math.min(90, centerLat + latSpan / 2),
    south: Math.max(-90, centerLat - latSpan / 2),
    east: centerLng + lngSpan / 2,
    west: centerLng - lngSpan / 2,
  }
}

export function isPointInBounds(
  lat: number,
  lng: number,
  bounds: Bounds,
): boolean {
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  )
}
