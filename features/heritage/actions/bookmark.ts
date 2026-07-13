"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { toggleBookmark, getBookmarkedSites } from "../services"

export async function toggleBookmarkAction(siteId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  return toggleBookmark(user.id, siteId)
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
