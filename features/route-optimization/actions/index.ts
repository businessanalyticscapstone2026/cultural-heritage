"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { CACHE_TAGS } from "@/lib/cache-tags"
import { z } from "zod"
import { createRoute, generateRouteOptions, getRoute, listRoutes, saveRoute, updateRouteStatus } from "../services"
import type { OptimizedRoute, CreateRouteInput, GenerateRouteOptionsInput, RouteOptionsResult } from "../types"

// z.guid accepts any 8-4-4-4-12 hex id (some seeded ids are not strict RFC uuids).
const siteId = z.guid("Invalid heritage site")

const generateSchema = z.object({
  // The real stop limit comes from routing_config and is checked in the service.
  siteIds: z.array(siteId).min(2, "Pick at least 2 stops.").max(50),
  startMode: z.enum(["origin", "best", "first"]),
  origin: z
    .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
    .nullable(),
  roundTrip: z.boolean(),
  travelMode: z.enum(["auto", "walking", "driving"]),
  includeMyOrder: z.boolean(),
  siteCoordinates: z
    .record(
      z.string(),
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
    )
    .optional(),
})

const saveSchema = z.object({
  name: z.string().trim().min(1, "Please give the route a name.").max(120),
  totalDistanceKm: z.number().min(0).max(5000),
  totalDurationMin: z.number().min(0).max(10000),
  stops: z
    .array(
      z.object({
        siteId,
        distanceFromPrevKm: z.number().min(0).max(5000).nullable(),
        travelTimeFromPrevMin: z.number().min(0).max(10000).nullable(),
      }),
    )
    .min(2)
    .max(50),
})

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input"
}

// Expected problems are returned, not thrown: Next.js hides thrown messages in production.
type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

function failure(e: unknown, fallback: string): { ok: false; error: string } {
  console.error("[Route]", e)
  return { ok: false, error: e instanceof Error ? e.message : fallback }
}

/** Returns the logged-in user's tourist id, or null for guests and staff. */
async function getTouristId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from("tourist_profiles").select("id").eq("id", user.id).maybeSingle()
  return profile ? user.id : null
}

/** Computes route options for the chosen stops. Saves nothing; guests may use it. */
export async function generateRouteOptionsAction(
  input: GenerateRouteOptionsInput,
): Promise<ActionResult<RouteOptionsResult>> {
  const parsed = generateSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    return { ok: true, data: await generateRouteOptions(supabase, parsed.data) }
  } catch (e) {
    return failure(e, "Could not find routes. Please try again.")
  }
}

/** Saves the route option the tourist picked. Requires a logged-in tourist. */
export async function saveRouteAction(input: z.input<typeof saveSchema>): Promise<ActionResult<{ id: string }>> {
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const touristId = await getTouristId(supabase)
    if (!touristId) return { ok: false, error: "Log in with a tourist account to save this route." }

    const saved = await saveRoute(supabase, { ...parsed.data, touristId })

    revalidatePath("/routes")
    revalidateTag(CACHE_TAGS.routes, { expire: 0 })
    revalidateTag(CACHE_TAGS.analytics, { expire: 0 })

    return { ok: true, data: { id: saved.id } }
  } catch (e) {
    return failure(e, "Could not save the route. Please try again.")
  }
}

export async function createRouteAction(
  input: Omit<CreateRouteInput, "touristId">,
): Promise<OptimizedRoute> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const touristId = await getTouristId(supabase)

  const route = await createRoute(supabase, { ...input, touristId })

  revalidatePath("/routes")
  revalidateTag(CACHE_TAGS.routes, { expire: 0 })
  revalidateTag(CACHE_TAGS.analytics, { expire: 0 })

  return route
}

export async function getRouteAction(routeId: string): Promise<OptimizedRoute | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  return getRoute(supabase, routeId)
}

export async function listRoutesAction(): Promise<OptimizedRoute[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return listRoutes(supabase, user.id)
}

export async function completeRouteAction(routeId: string): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  await updateRouteStatus(supabase, routeId, "completed")

  revalidatePath("/routes")
}
