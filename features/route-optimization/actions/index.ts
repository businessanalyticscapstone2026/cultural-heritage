"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { createRoute, getRoute, listRoutes, updateRouteStatus } from "../services"
import type { OptimizedRoute, CreateRouteInput } from "../types"

export async function createRouteAction(
  input: Omit<CreateRouteInput, "touristId">,
): Promise<OptimizedRoute> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  const touristId = user?.id ?? null

  const route = await createRoute(supabase, { ...input, touristId })

  revalidatePath("/routes")

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
