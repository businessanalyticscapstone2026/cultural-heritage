"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { CACHE_TAGS } from "@/lib/cache-tags"
import { createRoute, getRoute, listRoutes, updateRouteStatus } from "../services"
import type { OptimizedRoute, CreateRouteInput } from "../types"

export async function createRouteAction(
  input: Omit<CreateRouteInput, "touristId">,
): Promise<OptimizedRoute> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let touristId: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("tourist_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()
    if (profile) {
      touristId = user.id
    }
  }

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
