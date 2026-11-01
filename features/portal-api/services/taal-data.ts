import { unstable_cache } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags"
import { createTokenClient } from "@/utils/supabase/cached"
import { listPublishedReviews } from "@/features/reviews/services"
import { PORTAL_MUNICIPALITY_NAME } from "../constants"
import type { HeritageSitesQuery, ReviewsQuery } from "../schemas/portal-query"
import type { PortalHeritageSite, PortalReview } from "../types"
import { dependencyUnavailable, isPortalApiError, PortalApiError } from "./portal-errors"
import {
  PORTAL_SITE_COLUMNS,
  serializeHeritageSite,
  serializeReview,
  type PortalSiteRow,
} from "./serializers"

/**
 * Public Taal data for the portal API. All reads use the anon (publishable
 * key) client, so RLS decides visibility, and additionally filter on
 * published + public explicitly. Results are cached with unstable_cache and
 * invalidated by the portal tags (review writes) and the existing
 * heritage-sites / municipalities tags (staff edits).
 */

/** Upper bound on Taal sites considered for review filtering. */
const MAX_TAAL_SITES = 1000

interface Municipality {
  id: string
  name: string
}

export interface PortalPage<T> {
  items: T[]
  total: number
}

/** Anonymous client: no user token, RLS applies as the anon role. */
function anonClient(): SupabaseClient {
  return createTokenClient("")
}

function offsetOf(query: { page: number; page_size: number }): number {
  return (query.page - 1) * query.page_size
}

async function fetchTaalMunicipality(supabase: SupabaseClient): Promise<Municipality> {
  const { data, error } = await supabase
    .from("municipalities")
    .select("id, name")
    .eq("name", PORTAL_MUNICIPALITY_NAME)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (error) throw dependencyUnavailable(error.message)
  if (!data) {
    throw new PortalApiError(404, "not_found", `${PORTAL_MUNICIPALITY_NAME} municipality is not available.`)
  }
  return { id: data.id as string, name: data.name as string }
}

async function fetchTaalSiteIds(supabase: SupabaseClient, municipalityId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("heritage_sites")
    .select("id")
    .eq("municipality_id", municipalityId)
    .eq("publication_status", "published")
    .eq("visibility", "public")
    .limit(MAX_TAAL_SITES)

  if (error) throw dependencyUnavailable(error.message)
  return (data ?? []).map((row) => row.id as string)
}

async function fetchTaalSitesPage(query: HeritageSitesQuery): Promise<PortalPage<PortalHeritageSite>> {
  const supabase = anonClient()
  const municipality = await fetchTaalMunicipality(supabase)
  const offset = offsetOf(query)
  const ascending = query.sort === "updated_asc"

  let request = supabase
    .from("heritage_sites")
    .select(PORTAL_SITE_COLUMNS, { count: "exact" })
    .eq("municipality_id", municipality.id)
    .eq("publication_status", "published")
    .eq("visibility", "public")

  if (query.updated_since) request = request.gte("updated_at", query.updated_since)

  const { data, error, count } = await request
    .order("updated_at", { ascending })
    .order("id", { ascending })
    .range(offset, offset + query.page_size - 1)

  if (error) throw dependencyUnavailable(error.message)

  const items = ((data ?? []) as unknown as PortalSiteRow[]).map((row) =>
    serializeHeritageSite(row, municipality.name)
  )
  return { items, total: count ?? 0 }
}

async function fetchTaalReviewsPage(query: ReviewsQuery): Promise<PortalPage<PortalReview>> {
  const supabase = anonClient()
  const municipality = await fetchTaalMunicipality(supabase)
  const siteIds = await fetchTaalSiteIds(supabase, municipality.id)

  if (query.site_id && !siteIds.includes(query.site_id)) {
    throw new PortalApiError(404, "not_found", "Heritage site not found in this municipality.")
  }

  try {
    const page = await listPublishedReviews(supabase, {
      siteIds: query.site_id ? [query.site_id] : siteIds,
      updatedSince: query.updated_since ?? null,
      order: query.sort === "updated_asc" ? "asc" : "desc",
      offset: offsetOf(query),
      limit: query.page_size,
    })
    return { items: page.reviews.map(serializeReview), total: page.total }
  } catch (err) {
    if (isPortalApiError(err)) throw err
    const detail = err instanceof Error ? err.message : JSON.stringify(err)
    throw dependencyUnavailable(detail)
  }
}

const cacheOptions = (tag: string) => ({
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [tag, CACHE_TAGS.heritageSites, CACHE_TAGS.municipalities],
})

/** Query args are the cache key (unstable_cache serializes arguments). */
export const getTaalHeritageSitesPage = unstable_cache(
  async (query: HeritageSitesQuery) => fetchTaalSitesPage(query),
  ["portal-taal-heritage-sites"],
  cacheOptions(CACHE_TAGS.portalHeritageSites)
)

export const getTaalReviewsPage = unstable_cache(
  async (query: ReviewsQuery) => fetchTaalReviewsPage(query),
  ["portal-taal-reviews"],
  cacheOptions(CACHE_TAGS.portalReviews)
)

/** Ids of published, public Taal sites (used to scope portal review writes). */
export const getTaalSiteIds = unstable_cache(
  async () => {
    const supabase = anonClient()
    const municipality = await fetchTaalMunicipality(supabase)
    return fetchTaalSiteIds(supabase, municipality.id)
  },
  ["portal-taal-site-ids"],
  cacheOptions(CACHE_TAGS.portalHeritageSites)
)
