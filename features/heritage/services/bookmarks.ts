import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import type { SavedSite } from "../types"

export async function isBookmarked(touristId: string, siteId: string): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { count, error } = await supabase
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function toggleBookmark(touristId: string, siteId: string): Promise<{ isBookmarked: boolean }> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("tourist_id", touristId)
    .eq("site_id", siteId)
    .maybeSingle()

  if (existing) {
    await supabase.from("bookmarks").delete().eq("id", existing.id)
    return { isBookmarked: false }
  }

  await supabase.from("bookmarks").insert({ tourist_id: touristId, site_id: siteId })
  return { isBookmarked: true }
}

export async function getBookmarkedSiteIds(touristId: string): Promise<string[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("bookmarks")
    .select("site_id")
    .eq("tourist_id", touristId)

  if (error) throw error
  return (data ?? []).map((row) => row.site_id as string)
}

export async function getBookmarkedSites(touristId: string): Promise<SavedSite[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      site_id,
      created_at,
      site:heritage_sites(
        id,
        site_name,
        municipality:municipalities(name),
        category:heritage_categories(name),
        media:heritage_site_media!inner(file_url, media_type)
      )
    `)
    .eq("tourist_id", touristId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const site = row.site as unknown as Record<string, unknown> | null
    if (!site) {
      return {
        siteId: row.site_id as string,
        siteName: "Deleted site",
        municipalityName: null,
        categoryName: null,
        thumbnail: null,
        savedAt: row.created_at as string,
      }
    }

    const munArr = site.municipality as { name: string }[] | null
    const mun = Array.isArray(munArr) ? munArr[0] : munArr
    const catArr = site.category as { name: string }[] | null
    const cat = Array.isArray(catArr) ? catArr[0] : catArr
    const mediaArr = (site.media ?? []) as { file_url: string; media_type: string }[]
    const image = mediaArr.find((m) => m.media_type === "image")

    return {
      siteId: site.id as string,
      siteName: site.site_name as string,
      municipalityName: mun?.name ?? null,
      categoryName: cat?.name ?? null,
      thumbnail: image?.file_url ?? null,
      savedAt: row.created_at as string,
    }
  })
}
