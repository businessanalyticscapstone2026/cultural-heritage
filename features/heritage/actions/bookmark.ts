"use server"

import { revalidateTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache-tags"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { toggleBookmark, getBookmarkedSites, getBookmarkedSiteIds } from "../services"

export async function toggleBookmarkAction(siteId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const result = await toggleBookmark(user.id, siteId)
  revalidateTag(CACHE_TAGS.dashboardKpis, { expire: 0 })
  return result
}

export async function getBookmarkedSitesAction() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  return getBookmarkedSites(user.id)
}

export async function getBookmarkedSiteIdsAction(): Promise<string[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  return getBookmarkedSiteIds(user.id)
}
