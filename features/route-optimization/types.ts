export interface RouteWaypoint {
  id: string
  name: string
  coordinates: [number, number]
}

export interface RouteStop {
  siteId: string
  siteName: string
  latitude: number
  longitude: number
  stopOrder: number
  distanceFromPrevKm: number | null
  travelTimeFromPrevMin: number | null
  estimatedArrival: string | null
  edgeIsEstimated: boolean
  thumbnail: string | null
  municipalityName: string | null
}

export interface OptimizedRoute {
  id: string | null
  name: string
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMin: number
  path: [number, number][]
  hasEstimatedEdges: boolean
  status: "draft" | "completed"
  createdAt: string | null
}

export interface CreateRouteInput {
  touristId: string | null
  name: string
  siteIds: string[]
}

export interface SiteDistance {
  siteAId: string
  siteBId: string
  distanceKm: number
  travelTimeMinutes: number | null
}

export interface DijkstraResult {
  distance: number
  time: number
  path: string[]
}

export interface RouteEdge {
  from: string
  to: string
  distanceKm: number
  travelTimeMin: number
  isEstimated: boolean
}
