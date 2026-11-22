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

export type RouteStrategy = "optimal" | "custom" | "roundtrip" | "alternative"

export interface RouteOption {
  id: string
  strategy: RouteStrategy
  title: string
  description: string
  badge?: string
  totalDistanceKm: number
  totalDurationMin: number
  path: [number, number][]
  stops: RouteStop[]
  hasEstimatedEdges: boolean
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
  options?: RouteOption[]
  selectedOptionIndex?: number
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
