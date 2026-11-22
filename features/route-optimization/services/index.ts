import { createClient } from "@/utils/supabase/server"
import { fetchMultiStopRoadRoute } from "@/features/gis/services/directions"
import { getRoutingConfigPublic } from "@/features/settings/services"
import { haversineDistance } from "@/utils/geo"
import { AUTO_WALK_MAX_KM, NEUTRAL_RATING } from "../constants"
import type {
  OptimizedRoute,
  RouteStop,
  CreateRouteInput,
  GenerateRouteOptionsInput,
  RouteOption,
  RouteOptionsResult,
  ExcludedSite,
  RouteTravelMode,
} from "../types"
import { dijkstra, type RouteGraph } from "./dijkstra"
import { coordinateProblem, getRoadMatrix, type MatrixPoint, type RoadMatrix } from "./matrix"
import { planRouteOptions, type PlannedOption } from "./options"

export { dijkstra } from "./dijkstra"

interface RawSite {
  id: string
  site_name: string
  latitude: number | null
  longitude: number | null
  municipality: { name: string } | null
  media: { file_url: string; is_primary: boolean }[]
}

interface PlannerSite extends RawSite {
  average_rating: number | null
  review_count: number | null
}

const PLANNER_SITE_COLUMNS =
  "id, site_name, latitude, longitude, average_rating, review_count, municipality:municipalities(name), media:heritage_site_media(file_url, is_primary)"

/** Id used for the tourist's own location in the distance table. */
const ORIGIN_ID = "origin"

/** Complete graph built from the road table: one edge per direction, with distance and time. */
function graphFromMatrix(points: MatrixPoint[], matrix: RoadMatrix): RouteGraph {
  const graph: RouteGraph = new Map()
  points.forEach((a, i) => {
    const edges = new Map()
    points.forEach((b, j) => {
      if (i === j) return
      edges.set(b.id, {
        from: a.id,
        to: b.id,
        distanceKm: matrix.distanceKm[i][j],
        travelTimeMin: matrix.durationMin[i][j],
        isEstimated: matrix.estimated,
      })
    })
    graph.set(a.id, edges)
  })
  return graph
}

/** Resolves "auto": walk when every pair of points is within AUTO_WALK_MAX_KM. */
export function resolveTravelMode(
  mode: RouteTravelMode,
  points: MatrixPoint[],
): Exclude<RouteTravelMode, "auto"> {
  if (mode !== "auto") return mode
  const close = points.every((a) =>
    points.every((b) => haversineDistance(a.latitude, a.longitude, b.latitude, b.longitude) <= AUTO_WALK_MAX_KM),
  )
  return close ? "walking" : "driving"
}

/**
 * Computes up to 6 route options for the chosen stops. Saves nothing.
 *
 * Steps: load sites (one query) -> leave out sites without a valid map location ->
 * road distance table (OSRM) -> Dijkstra for every pair (by distance and by time) ->
 * solver picks each option's order -> road line per distinct order (OSRM).
 */
export async function generateRouteOptions(
  supabase: ReturnType<typeof createClient>,
  input: GenerateRouteOptionsInput,
): Promise<RouteOptionsResult> {
  const config = await getRoutingConfigPublic()
  const siteIds = [...new Set(input.siteIds)]
  if (siteIds.length > config.maxStops) {
    throw new Error(
      `A route can have at most ${config.maxStops} stops. You picked ${siteIds.length}, please remove ${siteIds.length - config.maxStops}.`,
    )
  }

  const { data, error } = await supabase.from("heritage_sites").select(PLANNER_SITE_COLUMNS).in("id", siteIds)
  if (error) {
    console.error("[Route] Failed to load sites:", error.message)
    throw new Error("Could not load the selected sites. Please try again.")
  }
  const sitesById = new Map(((data ?? []) as unknown as PlannerSite[]).map((s) => [s.id, s]))

  // Keep the user's order; leave out sites we cannot place on the map.
  const routable: PlannerSite[] = []
  const excludedSites: ExcludedSite[] = []
  for (const id of siteIds) {
    const site = sitesById.get(id)
    const problem = site ? coordinateProblem(site.latitude, site.longitude) : "Site not found"
    if (site && !problem) routable.push(site)
    else excludedSites.push({ id, name: site?.site_name ?? "Unknown site", reason: problem ?? "Site not found" })
  }
  if (routable.length < 2) {
    const missing = excludedSites.map((s) => s.name).join(", ")
    throw new Error(
      `Not enough sites have map locations to build a route.${missing ? ` Left out: ${missing}.` : ""}`,
    )
  }

  const useOrigin = input.startMode === "origin" && input.origin !== null
  const points: MatrixPoint[] = [
    ...(useOrigin && input.origin
      ? [{ id: ORIGIN_ID, latitude: input.origin.latitude, longitude: input.origin.longitude }]
      : []),
    ...routable.map((s) => ({ id: s.id, latitude: Number(s.latitude), longitude: Number(s.longitude) })),
  ]

  const travelMode = resolveTravelMode(input.travelMode, points)
  const matrix = await getRoadMatrix(points, travelMode)
  const graph = graphFromMatrix(points, matrix)
  // Dijkstra gives the cheapest leg between every pair: by kilometres, and by minutes.
  const legKm = points.map((a) => points.map((b) => (a.id === b.id ? 0 : dijkstra(graph, a.id, b.id).distance)))
  const legMin = points.map((a) =>
    points.map((b) => (a.id === b.id ? 0 : dijkstra(graph, a.id, b.id, { weight: "time" }).time)),
  )

  const { options: planned, recommendedKind } = planRouteOptions({
    legKm,
    legMin,
    towns: points.map((p) => sitesById.get(p.id)?.municipality?.name ?? null),
    ratings: points.map((p) => {
      const site = sitesById.get(p.id)
      if (!site) return 0
      return (site.review_count ?? 0) > 0 ? Number(site.average_rating) / 5 : NEUTRAL_RATING
    }),
    start: useOrigin || input.startMode === "first" ? 0 : null,
    roundTrip: input.roundTrip,
    maxTravelTimeMinutes: config.maxTravelTimeMinutes,
    preferShortestDistance: config.preferShortestDistance,
    myOrder: input.includeMyOrder ? points.map((_, i) => i) : null,
  })

  const options = await Promise.all(
    planned.map((p) =>
      buildOption(p, { points, sitesById, legKm, legMin, matrix, roundTrip: input.roundTrip, travelMode }),
    ),
  )

  const warnings: string[] = []
  if (options.some((o) => o.estimated)) warnings.push("Showing estimated distances. The road map service could not be reached.")
  if (options.some((o) => o.exceedsTimeLimit)) {
    warnings.push(`Some routes take longer than the ${config.maxTravelTimeMinutes}-minute limit.`)
  }

  return {
    options,
    recommendedKind,
    excludedSites,
    warnings,
    startsAtOrigin: useOrigin,
    roundTrip: input.roundTrip,
    travelMode,
  }
}

/**
 * Turns a planned order into a full option with stops and the map line.
 * All numbers come from the road table (the same numbers used to choose the
 * order), so Shortest is never longer than another card. The OSRM route call
 * is only used for the road-following line.
 */
async function buildOption(
  planned: PlannedOption,
  ctx: {
    points: MatrixPoint[]
    sitesById: Map<string, PlannerSite>
    legKm: number[][]
    legMin: number[][]
    matrix: RoadMatrix
    roundTrip: boolean
    travelMode: Exclude<RouteTravelMode, "auto">
  },
): Promise<RouteOption> {
  const order = planned.order
  const waypoints: [number, number][] = order.map((i) => [ctx.points[i].longitude, ctx.points[i].latitude])
  if (ctx.roundTrip) waypoints.push(waypoints[0])

  // Road-following line; if it fails we draw a straight dashed line.
  const road = await fetchMultiStopRoadRoute(waypoints, ctx.travelMode)

  const stops: RouteStop[] = []
  let minutesSoFar = 0
  order.forEach((pointIndex, k) => {
    let legKm: number | null = null
    let legMin: number | null = null
    if (k > 0) {
      legKm = Math.round(ctx.legKm[order[k - 1]][pointIndex] * 10) / 10
      legMin = Math.round(ctx.legMin[order[k - 1]][pointIndex])
      minutesSoFar += legMin
    }
    const site = ctx.sitesById.get(ctx.points[pointIndex].id)
    if (!site) return // "my location" is not a stop
    const arrival = new Date()
    arrival.setMinutes(arrival.getMinutes() + minutesSoFar)
    stops.push({
      siteId: site.id,
      siteName: site.site_name,
      latitude: Number(site.latitude),
      longitude: Number(site.longitude),
      stopOrder: stops.length + 1,
      distanceFromPrevKm: legKm,
      travelTimeFromPrevMin: legMin,
      estimatedArrival: arrival.toISOString(),
      edgeIsEstimated: k > 0 && ctx.matrix.estimated,
      thumbnail: site.media?.find((m) => m.is_primary)?.file_url ?? null,
      municipalityName: site.municipality?.name ?? null,
    })
  })

  return {
    kind: planned.kind,
    labels: planned.labels,
    orderedSiteIds: stops.map((s) => s.siteId),
    stops,
    totalDistanceKm: planned.totalDistanceKm,
    totalDurationMin: planned.totalDurationMin,
    townChanges: planned.townChanges,
    path: road?.coordinates.length ? road.coordinates : waypoints,
    estimated: ctx.matrix.estimated || !road,
    exceedsTimeLimit: planned.exceedsTimeLimit,
    deltaVsShortest: planned.deltaVsShortest,
  }
}

export interface SaveRouteInput {
  touristId: string | null
  name: string
  totalDistanceKm: number
  totalDurationMin: number
  stops: { siteId: string; distanceFromPrevKm: number | null; travelTimeFromPrevMin: number | null }[]
}

/** Saves one chosen route option into `routes` and `route_stops`. */
export async function saveRoute(
  supabase: ReturnType<typeof createClient>,
  input: SaveRouteInput,
): Promise<{ id: string; createdAt: string }> {
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .insert({
      tourist_id: input.touristId,
      name: input.name,
      total_distance_km: input.totalDistanceKm,
      total_duration_minutes: input.totalDurationMin,
      status: "draft",
      is_curated: false,
    })
    .select("id, created_at")
    .single()

  if (routeError || !route) {
    console.error("[Route] Failed to save route:", routeError?.message)
    throw new Error("Could not save the route. Please try again.")
  }

  let minutesSoFar = 0
  const stopInserts = input.stops.map((stop, i) => {
    minutesSoFar += stop.travelTimeFromPrevMin ?? 0
    const arrival = new Date()
    arrival.setMinutes(arrival.getMinutes() + minutesSoFar)
    return {
      route_id: route.id,
      site_id: stop.siteId,
      stop_order: i + 1,
      distance_from_prev_km: stop.distanceFromPrevKm,
      estimated_arrival: arrival.toISOString(),
    }
  })

  const { error: stopsError } = await supabase.from("route_stops").insert(stopInserts)
  if (stopsError) {
    console.error("[Route] Failed to save route stops:", stopsError.message)
    // Do not leave a route without stops behind.
    const { error: cleanupError } = await supabase.from("routes").delete().eq("id", route.id)
    if (cleanupError) console.error("[Route] Failed to remove half-saved route:", cleanupError.message)
    throw new Error("Could not save the route stops. Please try again.")
  }

  return { id: route.id, createdAt: route.created_at }
}

/**
 * Old one-step flow kept for existing callers: build the options, take the
 * recommended one, and save it. Starts from the tourist's home location if set.
 */
export async function createRoute(
  supabase: ReturnType<typeof createClient>,
  input: CreateRouteInput,
): Promise<OptimizedRoute> {
  if (input.siteIds.length === 0) {
    throw new Error("At least one site is required to create a route")
  }

  let origin: { latitude: number; longitude: number } | null = null
  if (input.touristId) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("home_latitude, home_longitude")
      .eq("id", input.touristId)
      .maybeSingle()
    if (profile?.home_latitude && profile?.home_longitude) {
      origin = { latitude: Number(profile.home_latitude), longitude: Number(profile.home_longitude) }
    }
  }

  const result = await generateRouteOptions(supabase, {
    siteIds: input.siteIds,
    startMode: origin ? "origin" : "first",
    origin,
    roundTrip: false,
    travelMode: "auto",
    includeMyOrder: false,
  })
  const option = result.options.find((o) => o.labels.includes(result.recommendedKind)) ?? result.options[0]

  let saved: { id: string; createdAt: string } | null = null
  try {
    saved = await saveRoute(supabase, {
      touristId: input.touristId,
      name: input.name,
      totalDistanceKm: option.totalDistanceKm,
      totalDurationMin: option.totalDurationMin,
      stops: option.stops,
    })
  } catch {
    // Same as before: the route is still shown even if saving failed.
  }

  return {
    id: saved?.id ?? null,
    name: input.name,
    stops: option.stops,
    totalDistanceKm: option.totalDistanceKm,
    totalDurationMin: option.totalDurationMin,
    path: option.path,
    hasEstimatedEdges: option.estimated,
    status: "draft",
    createdAt: saved?.createdAt ?? new Date().toISOString(),
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
  }

  let path: [number, number][] = []

  if (stops.length >= 2) {
    const waypoints: [number, number][] = stops.map((s) => [s.longitude, s.latitude])
    const roadRoute = await fetchMultiStopRoadRoute(waypoints)
    if (roadRoute && roadRoute.coordinates.length > 0) {
      path = roadRoute.coordinates
    }
  }

  if (path.length === 0) {
    path = stops.map((s) => [s.longitude, s.latitude])
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
