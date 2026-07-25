import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createTokenClient, resolveAccessToken } from "@/utils/supabase/cached"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import type { HeritageSite, HeritageCategory } from "../types"
import type { Municipality } from "@/features/municipalities/types"
import { mapDbRowToSite } from "./sites"

const SITE_SELECT = `
  *,
  category:heritage_categories(*),
  municipality:municipalities(name),
  tags:heritage_site_tags(*),
  media:heritage_site_media(*),
  reference_links:heritage_site_reference_links(*)
`

async function fetchAllHeritageSites(supabase: SupabaseClient): Promise<HeritageSite[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select(SITE_SELECT)
    .order("created_at", { ascending: false })
    .order("sort_order", { foreignTable: "heritage_site_media", ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => mapDbRowToSite(row, row))
}

async function fetchAllCategories(supabase: SupabaseClient): Promise<HeritageCategory[]> {
  const { data, error } = await supabase
    .from("heritage_categories")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description ?? null) as string | null,
    icon: (row.icon ?? null) as string | null,
    color: (row.color ?? null) as string | null,
    displayOrder: (row.display_order ?? null) as number | null,
    status: (row.status ?? "active") as HeritageCategory["status"],
  }))
}

async function fetchMunicipalities(supabase: SupabaseClient): Promise<Municipality[]> {
  const { data, error } = await supabase
    .from("municipalities")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch municipalities: ${error.message}`)
  return data ?? []
}

export interface HeritageRepositoryData {
  sites: HeritageSite[]
  categories: HeritageCategory[]
  municipalities: Municipality[]
}

const getCachedRepositoryData = unstable_cache(
  async (accessToken: string): Promise<HeritageRepositoryData> => {
    const supabase = createTokenClient(accessToken)

    const [sites, categories, municipalities] = await Promise.all([
      fetchAllHeritageSites(supabase),
      fetchAllCategories(supabase),
      fetchMunicipalities(supabase),
    ])

    return { sites, categories, municipalities }
  },
  ["heritage-repository-data"],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [
      CACHE_TAGS.heritageSites,
      CACHE_TAGS.heritageCategories,
      CACHE_TAGS.municipalities,
    ],
  },
)

export async function getRepositoryData(): Promise<HeritageRepositoryData> {
  const accessToken = await resolveAccessToken()
  return getCachedRepositoryData(accessToken)
}
