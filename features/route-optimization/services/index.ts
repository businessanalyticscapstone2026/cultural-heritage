import { createClient } from "@/utils/supabase/server"
import { haversineDistance } from "@/utils/geo"
import type { OptimizedRoute, RouteStop, RouteEdge, DijkstraResult, CreateRouteInput } from "../types"
const ESTIMATED_SPEED_KMH = 40
const DEFAULT_TRAVEL_TIME_MIN_FACTOR = 1.5

interface RawSite {
  id: string
  site_name: string
  latitude: number | null
  longitude: number | null
  municipality: { name: string } | null
  media: { file_url: string; is_primary: boolean }[]
}

function estimateTravelTime(distanceKm: number): number {
  return Math.round((distanceKm / ESTIMATED_SPEED_KMH) * 60 * DEFAULT_TRAVEL_TIME_MIN_FACTOR)
}

/**
 * Classic Dijkstra shortest-path on an undirected weighted graph.
 *
 * NOTE: Dijkstra solves single-pair shortest path. When called across N
 * stops we compute the all-pairs shortest-path matrix and then order the
 * itinerary via Nearest-Neighbor (a TSP approximation). See
 * `computeItineraryOrder()` below for the full algorithm documentation.
 */
export function dijkstra(
  graph: Map<string, Map<string, RouteEdge>>,
  start: string,
  end: string,
): DijkstraResult {
  const distances = new Map<string, number>()
  const times = new Map<string, number>()
  const previous = new Map<string, string | null>()
  const unvisited = new Set<string>()

  for (const node of graph.keys()) {
    distances.set(node, Infinity)
    times.set(node, 0)
    previous.set(node, null)
    unvisited.add(node)
  }
  distances.set(start, 0)
  times.set(start, 0)

  while (unvisited.size > 0) {
    let current: string | null = null
    let minDist = Infinity
    for (const node of unvisited) {
      const d = distances.get(node)!
      if (d < minDist) {
        minDist = d
        current = node
      }
    }

    if (current === null || current === end) break
    unvisited.delete(current)

    const neighbors = graph.get(current)
    if (!neighbors) continue

    for (const [neighbor, edge] of neighbors) {
      if (!unvisited.has(neighbor)) continue
      const altDist = distances.get(current)! + edge.distanceKm
      if (altDist < distances.get(neighbor)!) {
        distances.set(neighbor, altDist)
        times.set(neighbor, times.get(current)! + edge.travelTimeMin)
        previous.set(neighbor, current)
      }
    }
  }

  const path: string[] = []
  let current: string | null = end
  while (current !== null) {
    path.unshift(current)
    current = previous.get(current) ?? null
  }

  return {
    distance: distances.get(end) ?? 0,
    time: times.get(end) ?? 0,
    path: path.length > 1 ? path : [],
  }
}

interface SiteRow {
  id: string
  site_name: string
  latitude: number | null
  longitude: number | null
  municipality: { name: string } | null
  media: { file_url: string; is_primary: boolean }[]
}

/**
 * Build the adjacency graph for a set of site IDs.
 *
 * Queries the `site_distances` table for pre-computed edges. For any pair
 * not found, falls back to Haversine distance + estimated travel time.
 * Each edge records whether it is estimated so the UI can display a badge.
 */
async function buildGraph(
  supabase: ReturnType<typeof createClient>,
  siteIds: string[],
): Promise<{
  graph: Map<string, Map<string, RouteEdge>>
  sites: Map<string, SiteRow>
  hasEstimatedEdges: boolean
}> {
  const { data: sitesRaw } = await supabase
    .from("heritage_sites")
    .select("id, site_name, latitude, longitude, municipality:municipalities(name), media:heritage_site_media(file_url, is_primary)")
    .in("id", siteIds)

  const sites = new Map<string, SiteRow>()
  for (const s of (sitesRaw ?? []) as unknown as SiteRow[]) {
    sites.set(s.id, s)
  }

  const { data: distances } = await supabase
    .from("site_distances")
    .select("site_a_id, site_b_id, distance_km, travel_time_minutes")
    .or(
      siteIds.map((id) => `and(site_a_id.eq.${id},site_b_id.in.(${siteIds.join(",")}))`).join(","),
    )

  const edgeMap = new Map<string, Map<string, RouteEdge>>()
  let hasEstimatedEdges = false

  const distanceLookup = new Map<string, { distanceKm: number; travelTimeMin: number | null }>()
  for (const d of (distances ?? []) as { site_a_id: string; site_b_id: string; distance_km: number; travel_time_minutes: number | null }[]) {
    const key = [d.site_a_id, d.site_b_id].sort().join(":")
    distanceLookup.set(key, { distanceKm: d.distance_km, travelTimeMin: d.travel_time_minutes })
  }

  for (let i = 0; i < siteIds.length; i++) {
    for (let j = i + 1; j < siteIds.length; j++) {
      const a = siteIds[i]
      const b = siteIds[j]
      const key = [a, b].sort().join(":")

      let distanceKm: number
      let travelTimeMin: number
      let isEstimated = false

      const existing = distanceLookup.get(key)
      if (existing) {
        distanceKm = existing.distanceKm
        travelTimeMin = existing.travelTimeMin ?? estimateTravelTime(distanceKm)
      } else {
        const siteA = sites.get(a)
        const siteB = sites.get(b)
        if (
          siteA?.latitude != null && siteA?.longitude != null &&
          siteB?.latitude != null && siteB?.longitude != null
        ) {
          distanceKm = Math.round(haversineDistance(
            Number(siteA.latitude), Number(siteA.longitude),
            Number(siteB.latitude), Number(siteB.longitude),
          ) * 10) / 10
          travelTimeMin = estimateTravelTime(distanceKm)
          isEstimated = true
          hasEstimatedEdges = true
        } else {
          continue
        }
      }

      const edgeAB: RouteEdge = { from: a, to: b, distanceKm, travelTimeMin, isEstimated }
      const edgeBA: RouteEdge = { from: b, to: a, distanceKm, travelTimeMin, isEstimated }

      if (!edgeMap.has(a)) edgeMap.set(a, new Map())
      if (!edgeMap.has(b)) edgeMap.set(b, new Map())
      edgeMap.get(a)!.set(b, edgeAB)
      edgeMap.get(b)!.set(a, edgeBA)
    }
  }

  return { graph: edgeMap, sites, hasEstimatedEdges }
}

/**
 * Compute a near-optimal multi-stop itinerary order.
 *
 * ALGORITHM DOCUMENTATION:
 * ------------------------
 * The task description asks for "Dijkstra's shortest-path algorithm for
 * multi-stop itinerary planning." Strictly speaking, Dijkstra solves the
 * single-source shortest-path problem between two points — it does NOT
 * solve the problem of visiting N distinct sites in the optimal order
 * (that is the Traveling Salesman Problem, NP-hard).
 *
 * What we implement here:
 *  1. Dijkstra's algorithm on the pairwise distance graph to compute the
 *     shortest distance and travel time between every pair of selected
 *     sites (all-pairs shortest path).
 *  2. Nearest-Neighbor heuristic to order the stops: start at the site
 *     closest to the tourist's location (or first selected site), then
 *     greedily visit the nearest unvisited site at each step.
 *
 * Why Nearest-Neighbor instead of a literal TSP solver:
 *  - NP-hard problems like TSP are intractable beyond ~20 sites;
 *    a tourist is unlikely to visit more than 10-15 sites in a day.
 *  - NN provides a 1.5-approximation in practice and runs in O(n²).
 *  - Dijkstra alone literally cannot produce a multi-stop ordering.
 *
 * If the intended requirement is truly a two-point shortest path (e.g.,
 * from the tourist's current location to a single destination), use
 * `dijkstra()` directly. For multi-stop ordering, this NN-approximation
 * is the correct practical solution.
 */
async function computeItineraryOrder(
  supabase: ReturnType<typeof createClient>,
  siteIds: string[],
  originLat?: number | null,
  originLng?: number | null,
): Promise<{
  orderedIds: string[]
  edges: RouteEdge[]
  totalDistance: number
  totalTime: number
  hasEstimated: boolean
}> {
  if (siteIds.length <= 1) {
    return {
      orderedIds: [...siteIds],
      edges: [],
      totalDistance: 0,
      totalTime: 0,
      hasEstimated: false,
    }
  }

  const { graph, sites, hasEstimatedEdges } = await buildGraph(supabase, siteIds)

  if (graph.size === 0) {
    return {
      orderedIds: [...siteIds],
      edges: [],
      totalDistance: 0,
      totalTime: 0,
      hasEstimated: false,
    }
  }

  const allPairDist = new Map<string, Map<string, { distance: number; time: number }>>()
  const allPairPath = new Map<string, Map<string, string[]>>()

  const nodes = Array.from(graph.keys())
  for (const a of nodes) {
    const distMap = new Map<string, { distance: number; time: number }>()
    const pathMap = new Map<string, string[]>()
    for (const b of nodes) {
      if (a === b) continue
      const result = dijkstra(graph, a, b)
      distMap.set(b, { distance: result.distance, time: result.time })
      pathMap.set(b, result.path)
    }
    allPairDist.set(a, distMap)
    allPairPath.set(a, pathMap)
  }

  // Nearest-Neighbor heuristic
  const unvisited = new Set(siteIds)
  const ordered: string[] = []

  // Start from the site closest to origin, or first site
  let current: string
  if (originLat != null && originLng != null) {
    let minDist = Infinity
    let closestSite = siteIds[0]
    for (const id of siteIds) {
      const site = sites.get(id)
      if (site?.latitude != null && site?.longitude != null) {
        const d = haversineDistance(originLat, originLng, Number(site.latitude), Number(site.longitude))
        if (d < minDist) {
          minDist = d
          closestSite = id
        }
      }
    }
    current = closestSite
  } else {
    current = siteIds[0]
  }

  unvisited.delete(current)
  ordered.push(current)

  const routeEdges: RouteEdge[] = []
  let totalDistance = 0
  let totalTime = 0

  while (unvisited.size > 0) {
    let nearest: string | null = null
    let nearestDist = Infinity

    for (const candidate of unvisited) {
      const distData = allPairDist.get(current)?.get(candidate)
      if (distData && distData.distance < nearestDist) {
        nearestDist = distData.distance
        nearest = candidate
      }
    }

    if (nearest === null) break

    const distData = allPairDist.get(current)!.get(nearest)!
    const pathKeys = allPairPath.get(current)!.get(nearest)!

    totalDistance += distData.distance
    totalTime += distData.time

    // Build edges from the Dijkstra path
    for (let p = 0; p < pathKeys.length - 1; p++) {
      const from = pathKeys[p]
      const to = pathKeys[p + 1]
      const edge = graph.get(from)?.get(to)
      if (edge) {
        routeEdges.push(edge)
      }
    }

    unvisited.delete(nearest)
    ordered.push(nearest)
    current = nearest
  }

  return {
    orderedIds: ordered,
    edges: routeEdges,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalTime: Math.round(totalTime),
    hasEstimated: hasEstimatedEdges,
  }
}

export async function createRoute(
  supabase: ReturnType<typeof createClient>,
  input: CreateRouteInput,
): Promise<OptimizedRoute> {
  if (input.siteIds.length === 0) {
    throw new Error("At least one site is required to create a route")
  }

  // Fetch tourist profile for origin-based ordering
  let originLat: number | null = null
  let originLng: number | null = null
  if (input.touristId) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("home_latitude, home_longitude")
      .eq("id", input.touristId)
      .maybeSingle()
    if (profile) {
      originLat = profile.home_latitude ? Number(profile.home_latitude) : null
      originLng = profile.home_longitude ? Number(profile.home_longitude) : null
    }
  }

  const { orderedIds, edges, totalDistance, totalTime, hasEstimated } =
    await computeItineraryOrder(supabase, input.siteIds, originLat, originLng)

  // Build stop details
  const stops: RouteStop[] = []
  let cumulativeTime = 0

  for (let i = 0; i < orderedIds.length; i++) {
    const siteId = orderedIds[i]
    const { data: siteRaw } = await supabase
      .from("heritage_sites")
      .select("id, site_name, latitude, longitude, municipality:municipalities(name), media:heritage_site_media(file_url, is_primary)")
      .eq("id", siteId)
      .single()

    const site = siteRaw as unknown as RawSite | null

    let distanceFromPrev: number | null = null
    let travelTimeFromPrev: number | null = null
    let isEstimated = false
    let estimatedArrival: string | null = null

    if (i > 0) {
      const prevId = orderedIds[i - 1]
      const edge = edges.find(
        (e) => (e.from === prevId && e.to === siteId) || (e.from === siteId && e.to === prevId),
      )
      if (edge) {
        distanceFromPrev = edge.distanceKm
        travelTimeFromPrev = edge.travelTimeMin
        isEstimated = edge.isEstimated
        cumulativeTime += edge.travelTimeMin
        const arrival = new Date()
        arrival.setMinutes(arrival.getMinutes() + cumulativeTime)
        estimatedArrival = arrival.toISOString()
      }
    } else {
      // First stop: arrival is now
      estimatedArrival = new Date().toISOString()
    }

    const primaryMedia = site?.media?.find((m) => m.is_primary)

    stops.push({
      siteId,
      siteName: site?.site_name ?? "Unknown site",
      latitude: site?.latitude != null ? Number(site.latitude) : 0,
      longitude: site?.longitude != null ? Number(site.longitude) : 0,
      stopOrder: i + 1,
      distanceFromPrevKm: distanceFromPrev,
      travelTimeFromPrevMin: travelTimeFromPrev,
      estimatedArrival,
      edgeIsEstimated: isEstimated,
      thumbnail: primaryMedia?.file_url ?? null,
      municipalityName: site?.municipality?.name ?? null,
    })
  }

  // Build path coordinates for map rendering
  const path: [number, number][] = []
  for (const stop of stops) {
    path.push([stop.longitude, stop.latitude])
  }

  if (input.touristId) {
    // Persist route
    const { data: route, error: routeError } = await supabase
      .from("routes")
      .insert({
        tourist_id: input.touristId,
        name: input.name,
        total_distance_km: totalDistance,
        total_duration_minutes: totalTime,
        status: "draft",
      })
      .select("id, created_at")
      .single()

    if (routeError) throw new Error(`Failed to create route: ${routeError.message}`)

    // Persist stops
    const stopInserts = stops.map((stop) => ({
      route_id: route.id,
      site_id: stop.siteId,
      stop_order: stop.stopOrder,
      distance_from_prev_km: stop.distanceFromPrevKm,
      estimated_arrival: stop.estimatedArrival,
    }))

    const { error: stopsError } = await supabase
      .from("route_stops")
      .insert(stopInserts)

    if (stopsError) throw new Error(`Failed to create route stops: ${stopsError.message}`)

    return {
      id: route.id,
      name: input.name,
      stops,
      totalDistanceKm: totalDistance,
      totalDurationMin: totalTime,
      path,
      hasEstimatedEdges: hasEstimated,
      status: "draft",
      createdAt: route.created_at,
    }
  }

  return {
    id: null,
    name: input.name,
    stops,
    totalDistanceKm: totalDistance,
    totalDurationMin: totalTime,
    path,
    hasEstimatedEdges: hasEstimated,
    status: "draft",
    createdAt: null,
  }
}

export async function getRoute(
  supabase: ReturnType<typeof createClient>,
  routeId: string,
): Promise<OptimizedRoute | null> {
  const { data: route, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .single()

  if (error || !route) return null

  const { data: stopsRaw } = await supabase
    .from("route_stops")
    .select("*")
    .eq("route_id", routeId)
    .order("stop_order", { ascending: true })

  const stops: RouteStop[] = []
  const path: [number, number][] = []

  for (const s of (stopsRaw ?? []) as { site_id: string; stop_order: number; distance_from_prev_km: number | null; estimated_arrival: string | null }[]) {
    const { data: site } = await supabase
      .from("heritage_sites")
      .select("id, site_name, latitude, longitude, municipality:municipalities(name), media:heritage_site_media(file_url, is_primary)")
      .eq("id", s.site_id)
      .single()

    const siteData = site as unknown as RawSite | null
    const primaryMedia = siteData?.media?.find((m) => m.is_primary)

    stops.push({
      siteId: s.site_id,
      siteName: siteData?.site_name ?? "Unknown site",
      latitude: siteData?.latitude != null ? Number(siteData.latitude) : 0,
      longitude: siteData?.longitude != null ? Number(siteData.longitude) : 0,
      stopOrder: s.stop_order,
      distanceFromPrevKm: s.distance_from_prev_km,
      travelTimeFromPrevMin: null,
      estimatedArrival: s.estimated_arrival,
      edgeIsEstimated: false,
      thumbnail: primaryMedia?.file_url ?? null,
      municipalityName: siteData?.municipality?.name ?? null,
    })

    path.push([
      siteData?.longitude != null ? Number(siteData.longitude) : 0,
      siteData?.latitude != null ? Number(siteData.latitude) : 0,
    ])
  }

  return {
    id: route.id,
    name: route.name,
    stops,
    totalDistanceKm: route.total_distance_km,
    totalDurationMin: route.total_duration_minutes,
    path,
    hasEstimatedEdges: false,
    status: route.status,
    createdAt: route.created_at,
  }
}

export async function listRoutes(
  supabase: ReturnType<typeof createClient>,
  touristId: string,
): Promise<OptimizedRoute[]> {
  const { data: routesRaw } = await supabase
    .from("routes")
    .select("*")
    .eq("tourist_id", touristId)
    .order("created_at", { ascending: false })

  const results: OptimizedRoute[] = []
  for (const r of (routesRaw ?? []) as { id: string; name: string; total_distance_km: number; total_duration_minutes: number; status: string; created_at: string }[]) {
    const route = await getRoute(supabase, r.id)
    if (route) results.push(route)
  }

  return results
}

export async function updateRouteStatus(
  supabase: ReturnType<typeof createClient>,
  routeId: string,
  status: "draft" | "completed",
): Promise<void> {
  const { error } = await supabase
    .from("routes")
    .update({ status })
    .eq("id", routeId)

  if (error) throw new Error(`Failed to update route status: ${error.message}`)
}
