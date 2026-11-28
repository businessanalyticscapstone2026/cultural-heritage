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

export type RouteOptionKind = "shortest" | "fastest" | "balanced" | "highlights" | "one-town" | "my-order"

/** Where the route starts: the tourist's location, the best stop (solver picks), or the first stop picked. */
export type RouteStartMode = "origin" | "best" | "first"

/** How the tourist travels between stops. "auto" walks when every stop is close together. */
export type RouteTravelMode = "auto" | "walking" | "driving"

export interface RouteOption {
  /** Main kind of this card (first of `labels`). */
  kind: RouteOptionKind
  /** All kinds that produced this same stop order (duplicates are merged into one card). */
  labels: RouteOptionKind[]
  orderedSiteIds: string[]
  stops: RouteStop[]
  totalDistanceKm: number
  totalDurationMin: number
  townChanges: number
  path: [number, number][]
  /** True when distances or the map line are estimates (road router unreachable). */
  estimated: boolean
  exceedsTimeLimit: boolean
  deltaVsShortest: { km: number; min: number }
}

export interface ExcludedSite {
  id: string
  name: string
  reason: string
}

export interface RouteOptionsResult {
  options: RouteOption[]
  recommendedKind: RouteOptionKind
  excludedSites: ExcludedSite[]
  warnings: string[]
  /** True when the trip starts at the tourist's location (not a heritage site). */
  startsAtOrigin: boolean
  roundTrip: boolean
  /** Mode actually used ("auto" already resolved). */
  travelMode: Exclude<RouteTravelMode, "auto">
}

export interface GenerateRouteOptionsInput {
  siteIds: string[]
  startMode: RouteStartMode
  origin: { latitude: number; longitude: number } | null
  roundTrip: boolean
  travelMode: RouteTravelMode
  /** Include the "My order" card (the user changed the order by hand). */
  includeMyOrder: boolean
  /** Exact map display coordinates for sites (e.g. from barangay centre spreading). */
  siteCoordinates?: Record<string, { latitude: number; longitude: number }>
}
